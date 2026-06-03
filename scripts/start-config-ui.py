#!/usr/bin/env python3
"""Local configuration UI server for Codex Voice Reply Plugin."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import subprocess
import sys
import time
import tomllib
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import quote, unquote
import webbrowser
from xml.sax.saxutils import escape as xml_escape


REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = REPO_ROOT / "web" / "config-ui"
SAMPLES_ROOT = REPO_ROOT / "samples"
PREVIEW_ROOT = REPO_ROOT / "out" / "config-ui-previews"
SETTINGS_FILES = ("voice-project-settings.json", ".codex-voice.json")
AUTOSTART_ID = "codex-voice-reply-config-ui"
LAUNCH_AGENT_LABEL = "com.codex.voice-reply.config-ui"
PREVIEW_MAX_AGE_SECONDS = 6 * 60 * 60
PREVIEW_MAX_FILES = 80
LOCALE_PREVIEW_VOICES = {
    "en": {"voice": "en-US-JennyNeural", "rate": "+0%", "pitch": "+0Hz"},
    "fr": {"voice": "fr-FR-DeniseNeural", "rate": "+0%", "pitch": "+0Hz"},
    "ja": {"voice": "ja-JP-NanamiNeural", "rate": "+0%", "pitch": "+0Hz"},
    "ko": {"voice": "ko-KR-SunHiNeural", "rate": "+0%", "pitch": "+0Hz"},
}
SUPPORTED_VOICE_LOCALES = {"zh-CN", *LOCALE_PREVIEW_VOICES.keys()}
SKIP_DIRS = {
    ".git",
    ".venv",
    ".codex",
    ".codex-plugin",
    ".github",
    "__pycache__",
    "node_modules",
    "out",
    "samples",
}
CODEX_CONVERSATION_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def codex_config_path() -> Path:
    return Path.home() / ".codex" / "config.toml"


def public_host(host: str) -> str:
    return "127.0.0.1" if host in {"", "0.0.0.0", "::"} else host


def config_ui_url(host: str, port: int) -> str:
    return f"http://{public_host(host)}:{port}/"


def cmd_quote(value: Path | str) -> str:
    return f'"{str(value).replace(chr(34), chr(34) + chr(34))}"'


def autostart_platform() -> str:
    if os.name == "nt":
        return "windows"
    if sys.platform == "darwin":
        return "macos"
    return sys.platform


def windows_startup_file() -> Path | None:
    appdata = os.environ.get("APPDATA")
    if not appdata:
        return None
    return Path(appdata) / "Microsoft" / "Windows" / "Start Menu" / "Programs" / "Startup" / f"{AUTOSTART_ID}.cmd"


def mac_launch_agent_file() -> Path:
    return Path.home() / "Library" / "LaunchAgents" / f"{LAUNCH_AGENT_LABEL}.plist"


def autostart_target_path() -> Path | None:
    platform = autostart_platform()
    if platform == "windows":
        return windows_startup_file()
    if platform == "macos":
        return mac_launch_agent_file()
    return None


def autostart_mechanism() -> str:
    platform = autostart_platform()
    if platform == "windows":
        return "Windows 固定地址服务"
    if platform == "macos":
        return "macOS 固定地址服务"
    return "当前系统暂未内置固定地址写入器"


def autostart_status(workspace_root: Path, host: str, port: int) -> dict[str, Any]:
    target_path = autostart_target_path()
    platform = autostart_platform()
    supported = platform in {"windows", "macos"} and target_path is not None
    enabled = bool(target_path and target_path.exists())
    return {
        "supported": supported,
        "platform": platform,
        "enabled": enabled,
        "targetPath": str(target_path) if target_path else None,
        "mechanism": autostart_mechanism(),
        "url": config_ui_url(host, port),
        "workspaceRoot": str(workspace_root),
        "codexLifecycleHook": False,
        "notes": "开启后，本机会在 Codex 启动时固定配置网页地址。",
    }


def write_windows_autostart(target_path: Path, workspace_root: Path, port: int) -> None:
    script = REPO_ROOT / "scripts" / "start-config-ui.ps1"
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(
        "\r\n".join(
            [
                "@echo off",
                "REM Created by Codex Voice Reply Plugin.",
                "REM Delete this file or turn off Fixed Address in the config UI to disable it.",
                (
                    "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden "
                    f"-File {cmd_quote(script)} -Port {int(port)} -WorkspaceRoot {cmd_quote(workspace_root)}"
                ),
                "",
            ]
        ),
        encoding="utf-8",
    )


def write_macos_autostart(target_path: Path, workspace_root: Path, host: str, port: int) -> None:
    script = REPO_ROOT / "scripts" / "start-config-ui.sh"
    out_root = REPO_ROOT / "out"
    out_root.mkdir(parents=True, exist_ok=True)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    arguments = [
        "/bin/bash",
        str(script),
        "--host",
        public_host(host),
        "--port",
        str(int(port)),
        "--workspace-root",
        str(workspace_root),
    ]
    argument_xml = "\n".join(f"    <string>{xml_escape(item)}</string>" for item in arguments)
    target_path.write_text(
        f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>{LAUNCH_AGENT_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
{argument_xml}
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>{xml_escape(str(out_root / "config-ui-autostart.log"))}</string>
  <key>StandardErrorPath</key>
  <string>{xml_escape(str(out_root / "config-ui-autostart.err.log"))}</string>
</dict>
</plist>
""",
        encoding="utf-8",
    )
    subprocess.run(["launchctl", "unload", str(target_path)], capture_output=True, text=True, check=False)
    subprocess.run(["launchctl", "load", "-w", str(target_path)], capture_output=True, text=True, check=False)


def set_autostart_enabled(enabled: bool, workspace_root: Path, host: str, port: int) -> dict[str, Any]:
    target_path = autostart_target_path()
    platform = autostart_platform()
    if platform not in {"windows", "macos"} or target_path is None:
        raise ValueError("This platform does not have a built-in config UI fixed-address writer yet.")

    if enabled:
        if platform == "windows":
            write_windows_autostart(target_path, workspace_root, port)
        else:
            write_macos_autostart(target_path, workspace_root, host, port)
    else:
        if platform == "macos" and target_path.exists():
            subprocess.run(["launchctl", "unload", str(target_path)], capture_output=True, text=True, check=False)
        if target_path.exists():
            target_path.unlink()

    return autostart_status(workspace_root, host, port)


def load_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return fallback
    except json.JSONDecodeError as exc:
        raise ValueError(f"Could not parse {path}: {exc}") from exc


def is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def normalize_optional_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def prune_preview_files(max_age_seconds: int = PREVIEW_MAX_AGE_SECONDS, max_files: int = PREVIEW_MAX_FILES) -> int:
    if not PREVIEW_ROOT.exists():
        return 0

    now = time.time()
    removed = 0
    files: list[Path] = []
    for path in PREVIEW_ROOT.glob("*.mp3"):
        try:
            if not path.is_file():
                continue
            age = now - path.stat().st_mtime
            if age > max_age_seconds:
                path.unlink()
                removed += 1
            else:
                files.append(path)
        except OSError:
            continue

    files.sort(key=lambda item: item.stat().st_mtime if item.exists() else 0, reverse=True)
    for path in files[max_files:]:
        try:
            path.unlink()
            removed += 1
        except OSError:
            continue

    return removed


def sanitize_custom_voice(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    voice = normalize_optional_text(value.get("voice"))
    if not voice:
        return None

    return {
        "profileName": normalize_optional_text(value.get("profileName")) or "custom_project_voice",
        "label": normalize_optional_text(value.get("label")) or "Custom voice",
        "trait": normalize_optional_text(value.get("trait")) or "custom",
        "prompt": normalize_optional_text(value.get("prompt")),
        "locale": normalize_optional_text(value.get("locale")) or "zh-CN",
        "voice": voice,
        "rate": normalize_optional_text(value.get("rate")) or "+0%",
        "pitch": normalize_optional_text(value.get("pitch")) or "+0Hz",
        "style": normalize_optional_text(value.get("style")) or "Custom voice",
        "previewText": normalize_optional_text(value.get("previewText")) or "Ready when you are.",
    }


def normalized_locale(value: Any) -> str:
    locale = str(value or "zh-CN").strip()
    if locale.startswith("zh"):
        return "zh-CN"
    normalized = locale.split("-", 1)[0].lower()
    return normalized if normalized in SUPPORTED_VOICE_LOCALES else "zh-CN"


def project_settings_path(project_root: Path) -> Path | None:
    for file_name in SETTINGS_FILES:
        candidate = project_root / file_name
        if candidate.exists():
            return candidate
    return None


def read_project_settings(project_root: Path) -> tuple[str | None, dict[str, Any] | None]:
    path = project_settings_path(project_root)
    if path is None:
        return None, None

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        data = {
            "_parseError": True,
            "notes": f"Could not parse {path.name}; applying new settings will overwrite it.",
        }
    return path.name, data


def infer_strategy(project_path: Path, strategies_config: dict[str, Any]) -> str:
    matched_strategy = matched_project_strategy(project_path, strategies_config)
    if matched_strategy:
        return matched_strategy
    return str(strategies_config.get("defaultStrategy") or "reserved_partner_default")


def matched_project_strategy(project_path: Path, strategies_config: dict[str, Any]) -> str | None:
    path_text = str(project_path).replace("\\", "/").lower()
    name_text = project_path.name.lower()
    for item in strategies_config.get("projectMatches", []):
        needle = str(item.get("pathContains", "")).lower()
        if not needle:
            continue
        if ("/" in needle or "\\" in needle) and needle.replace("\\", "/") in path_text:
            return str(item.get("strategy") or strategies_config.get("defaultStrategy"))
        if needle in name_text:
            return str(item.get("strategy") or strategies_config.get("defaultStrategy"))
    return None


def default_project_tag(strategies_config: dict[str, Any]) -> str:
    return str(strategies_config.get("defaultProjectTag") or "default_reserved")


def tag_for_strategy(strategy_name: str | None, strategies_config: dict[str, Any]) -> str | None:
    if not strategy_name:
        return None
    for tag_name, tag in strategies_config.get("projectTags", {}).items():
        if tag.get("strategy") == strategy_name:
            return str(tag_name)
    return None


def auto_project_tag(project_path: Path, strategies_config: dict[str, Any]) -> tuple[str | None, str | None]:
    auto_config = strategies_config.get("autoProjectTagAssignment", {})
    if not auto_config.get("enabled", False):
        return None, None

    tags = strategies_config.get("projectTags", {})
    path_text = str(project_path).replace("\\", "/").lower()
    keyword_text = project_path.name.lower()

    for rule in auto_config.get("keywordRules", []):
        tag_name = normalize_optional_text(rule.get("projectTag"))
        if not tag_name or tag_name not in tags:
            continue
        terms = rule.get("pathContains", [])
        if any(str(term).lower() in keyword_text for term in terms):
            return tag_name, "auto_keyword"

    candidates = [tag for tag in auto_config.get("candidateTags", []) if tag in tags and tag != "silent_project"]
    if not candidates:
        return None, None

    digest = hashlib.sha256(path_text.encode("utf-8")).hexdigest()
    index = int(digest[:8], 16) % len(candidates)
    return candidates[index], "auto_hash"


def resolve_project_tag(
    project_path: Path,
    settings: dict[str, Any] | None,
    strategies_config: dict[str, Any],
) -> tuple[str, str]:
    tags = strategies_config.get("projectTags", {})
    configured_tag = normalize_optional_text((settings or {}).get("projectTag"))
    if configured_tag in tags:
        return configured_tag, "project_settings_tag"

    configured_strategy = normalize_optional_text((settings or {}).get("strategy"))
    strategy_tag = tag_for_strategy(configured_strategy, strategies_config)
    if strategy_tag:
        return strategy_tag, "project_settings_strategy"

    matched_strategy = matched_project_strategy(project_path, strategies_config)
    matched_tag = tag_for_strategy(matched_strategy, strategies_config)
    if matched_tag:
        return matched_tag, "central_project_match"

    if settings is None:
        auto_tag, auto_source = auto_project_tag(project_path, strategies_config)
        if auto_tag:
            return auto_tag, auto_source or "auto"

    fallback_tag = default_project_tag(strategies_config)
    if fallback_tag in tags:
        return fallback_tag, "global_default"

    return "", "unknown"


def summarize_project(
    project_root: Path,
    strategies_config: dict[str, Any],
    modes_config: dict[str, Any],
) -> dict[str, Any]:
    settings_file, settings = read_project_settings(project_root)
    strategies = strategies_config.get("strategies", {})
    tags = strategies_config.get("projectTags", {})
    tag_name, tag_source = resolve_project_tag(project_root, settings, strategies_config)
    tag = tags.get(tag_name, {})
    default_strategy = infer_strategy(project_root, strategies_config)
    strategy_name = normalize_optional_text((settings or {}).get("strategy")) or tag.get("strategy") or default_strategy
    strategy = strategies.get(strategy_name, {})

    custom_voice = sanitize_custom_voice((settings or {}).get("customVoice"))
    voice_locale = normalized_locale(
        (custom_voice or {}).get("locale")
        or (settings or {}).get("voiceLocale")
        or (settings or {}).get("locale")
    )
    mode_name = normalize_optional_text((settings or {}).get("modeOverride")) or tag.get("modeOverride") or strategy.get("mode")
    voice_profile = (
        custom_voice.get("profileName")
        if custom_voice
        else normalize_optional_text((settings or {}).get("voiceOverride")) or tag.get("voiceOverride") or strategy.get("voiceProfile")
    )
    label = (
        normalize_optional_text((custom_voice or {}).get("label"))
        or tag.get("voiceIdentityLabel")
        or normalize_optional_text((settings or {}).get("voiceIdentityLabel"))
        or strategy.get("voiceIdentityLabel")
    )
    suppress_all = (
        bool((settings or {}).get("suppressAllSpeech"))
        or bool(tag.get("suppressAllSpeech"))
        or strategy_name == "voice_disabled"
        or mode_name == "voice_disabled"
    )

    voice_profiles = modes_config.get("voiceProfiles", {})
    voice = custom_voice or voice_profiles.get(voice_profile or "", {})

    return {
        "name": project_root.name,
        "path": str(project_root),
        "settingsFile": settings_file,
        "settings": settings,
        "effective": {
            "projectTag": tag_name,
            "projectTagDisplayName": tag.get("displayName", tag_name),
            "projectTagSource": tag_source,
            "strategy": strategy_name,
            "strategyDisplayName": strategy.get("displayName", strategy_name),
            "mode": mode_name,
            "voiceProfile": voice_profile,
            "voiceIdentityLabel": label,
            "voiceLocale": voice_locale,
            "voiceEnabled": not suppress_all,
            "voice": voice,
            "customVoice": custom_voice,
        },
    }


def is_codex_project_dir(path: Path) -> bool:
    if not path.is_dir() or path.name in SKIP_DIRS:
        return False
    if is_codex_conversation_workspace_dir(path):
        return False
    return any(
        (path / marker).exists()
        for marker in (
            ".git",
            "AGENTS.md",
            "voice-project-settings.json",
            ".codex-voice.json",
            ".codex-plugin",
        )
    )


def is_codex_conversation_workspace_dir(path: Path) -> bool:
    """Return true for Codex's own dated conversation workspaces, not user projects."""
    try:
        resolved = path.resolve()
    except OSError:
        return False

    parent = resolved.parent
    if CODEX_CONVERSATION_DATE_RE.match(parent.name) is not None and resolved.name.lower() == "new-chat":
        return True

    documents_root = (Path.home() / "Documents" / "Codex").resolve()
    try:
        relative = resolved.relative_to(documents_root)
    except ValueError:
        return False

    parts = relative.parts
    return len(parts) >= 2 and CODEX_CONVERSATION_DATE_RE.match(parts[0]) is not None


def codex_config_projects() -> list[Path]:
    config_path = codex_config_path()
    try:
        config = tomllib.loads(config_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return []
    except (OSError, tomllib.TOMLDecodeError):
        return []

    projects = config.get("projects", {})
    if not isinstance(projects, dict):
        return []

    paths: list[Path] = []
    for raw_path in projects:
        if not isinstance(raw_path, str) or not raw_path.strip():
            continue
        try:
            project_path = Path(raw_path).expanduser().resolve()
        except OSError:
            continue
        if project_path.exists() and project_path.is_dir() and not is_codex_conversation_workspace_dir(project_path):
            paths.append(project_path)
    return paths


def is_codex_config_project(path: Path) -> bool:
    try:
        resolved = path.resolve()
    except OSError:
        return False
    return any(resolved == project_path for project_path in codex_config_projects())


def scan_projects(workspace_root: Path, strategies_config: dict[str, Any], modes_config: dict[str, Any]) -> list[dict[str, Any]]:
    projects: dict[str, Path] = {}

    def add(path: Path) -> None:
        try:
            resolved = path.resolve()
        except OSError:
            return
        projects[str(resolved).lower()] = resolved

    if is_codex_project_dir(REPO_ROOT):
        add(REPO_ROOT)

    for project_path in codex_config_projects():
        add(project_path)

    if workspace_root.exists():
        roots = [workspace_root]
        for depth_root in roots:
            try:
                children = [item for item in depth_root.iterdir() if item.is_dir() and item.name not in SKIP_DIRS]
            except OSError:
                continue

            for child in children:
                if is_codex_project_dir(child):
                    add(child)
                if child.parent == workspace_root:
                    try:
                        for grandchild in child.iterdir():
                            if grandchild.is_dir() and grandchild.name not in SKIP_DIRS and is_codex_project_dir(grandchild):
                                add(grandchild)
                    except OSError:
                        continue

    return sorted(
        (summarize_project(path, strategies_config, modes_config) for path in projects.values()),
        key=lambda item: item["name"].lower(),
    )


def build_settings(payload: dict[str, Any], strategies_config: dict[str, Any], modes_config: dict[str, Any]) -> dict[str, Any]:
    strategies = strategies_config.get("strategies", {})
    tags = strategies_config.get("projectTags", {})
    modes = modes_config.get("modes", {})
    voices = modes_config.get("voiceProfiles", {})

    project_tag = normalize_optional_text(payload.get("projectTag")) or default_project_tag(strategies_config)
    if project_tag not in tags:
        raise ValueError(f"Unknown projectTag: {project_tag}")

    tag = tags[project_tag]

    strategy = normalize_optional_text(payload.get("strategy")) or tag.get("strategy") or strategies_config.get("defaultStrategy")
    if strategy not in strategies:
        raise ValueError(f"Unknown strategy: {strategy}")

    mode_override = normalize_optional_text(payload.get("modeOverride")) or normalize_optional_text(tag.get("modeOverride"))
    if mode_override is not None and mode_override not in modes:
        raise ValueError(f"Unknown modeOverride: {mode_override}")

    custom_voice = sanitize_custom_voice(payload.get("customVoice"))
    voice_locale = normalized_locale((custom_voice or {}).get("locale") or payload.get("voiceLocale") or payload.get("locale"))
    voice_override = None if custom_voice else normalize_optional_text(payload.get("voiceOverride")) or normalize_optional_text(tag.get("voiceOverride"))
    if voice_override is not None and voice_override not in voices:
        raise ValueError(f"Unknown voiceOverride: {voice_override}")

    suppress_all = bool(payload.get("suppressAllSpeech")) or bool(tag.get("suppressAllSpeech"))
    if strategy == "voice_disabled" or mode_override == "voice_disabled":
        strategy = "voice_disabled"
        mode_override = "voice_disabled"
        voice_override = None
        suppress_all = True

    settings: dict[str, Any] = {
        "projectTag": project_tag,
        "strategy": strategy,
        "modeOverride": mode_override,
        "voiceOverride": voice_override,
        "voiceIdentityLabel": normalize_optional_text(payload.get("voiceIdentityLabel")) or normalize_optional_text(tag.get("voiceIdentityLabel")),
        "voiceLocale": voice_locale,
        "suppressAllSpeech": suppress_all,
    }

    if custom_voice and not suppress_all:
        settings["customVoice"] = custom_voice

    notes = normalize_optional_text(payload.get("notes")) or normalize_optional_text(tag.get("description"))
    if notes:
        settings["notes"] = notes

    return settings


class ConfigUiServer(ThreadingHTTPServer):
    def __init__(
        self,
        server_address: tuple[str, int],
        workspace_root: Path,
        allow_outside_workspace: bool,
    ) -> None:
        super().__init__(server_address, ConfigUiHandler)
        self.host = server_address[0]
        self.port = server_address[1]
        self.workspace_root = workspace_root.resolve()
        self.allow_outside_workspace = allow_outside_workspace
        self.modes_config = load_json(REPO_ROOT / "voice-interaction-modes.json", {})
        self.strategies_config = load_json(REPO_ROOT / "project-voice-strategies.json", {})


class ConfigUiHandler(BaseHTTPRequestHandler):
    server: ConfigUiServer

    def do_GET(self) -> None:
        if self.path.startswith("/api/bootstrap"):
            pruned_previews = prune_preview_files()
            self.write_json(
                {
                    "repoRoot": str(REPO_ROOT),
                    "workspaceRoot": str(self.server.workspace_root),
                    "configUiUrl": config_ui_url(self.server.host, self.server.port),
                    "prunedPreviews": pruned_previews,
                    "autostart": autostart_status(self.server.workspace_root, self.server.host, self.server.port),
                    "modesConfig": self.server.modes_config,
                    "strategiesConfig": self.server.strategies_config,
                    "projects": scan_projects(
                        self.server.workspace_root,
                        self.server.strategies_config,
                        self.server.modes_config,
                    ),
                    "settingsFiles": SETTINGS_FILES,
                }
            )
            return

        if self.path.startswith("/api/autostart"):
            self.write_json({"ok": True, "autostart": autostart_status(self.server.workspace_root, self.server.host, self.server.port)})
            return

        if self.path.startswith("/api/sample-audio/"):
            self.serve_audio_file(SAMPLES_ROOT, self.path.removeprefix("/api/sample-audio/"))
            return

        if self.path.startswith("/api/preview-audio/"):
            self.serve_audio_file(PREVIEW_ROOT, self.path.removeprefix("/api/preview-audio/"))
            return

        self.serve_static()

    def do_POST(self) -> None:
        if self.path.startswith("/api/autostart"):
            self.apply_autostart()
            return
        if self.path.startswith("/api/cleanup-preview"):
            self.cleanup_preview()
            return
        if self.path.startswith("/api/apply-auto"):
            self.apply_auto_settings()
            return
        if self.path.startswith("/api/preview-voice"):
            self.preview_voice()
            return
        if self.path.startswith("/api/apply"):
            self.apply_settings()
            return
        self.write_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def apply_settings(self) -> None:
        try:
            payload = self.read_json_body()
            project_path = Path(str(payload.get("projectPath", ""))).expanduser().resolve()
            if not project_path.exists() or not project_path.is_dir():
                raise ValueError("Project path does not exist or is not a directory.")
            if (
                not self.server.allow_outside_workspace
                and not is_relative_to(project_path, self.server.workspace_root)
                and not is_codex_config_project(project_path)
            ):
                raise ValueError("Project path is outside the configured workspace root.")

            settings_file = str(payload.get("settingsFile") or SETTINGS_FILES[0])
            if settings_file not in SETTINGS_FILES:
                raise ValueError(f"Unsupported settings file: {settings_file}")

            settings = build_settings(payload, self.server.strategies_config, self.server.modes_config)
            target_path = project_path / settings_file
            target_path.write_text(
                json.dumps(settings, ensure_ascii=False, indent=2) + os.linesep,
                encoding="utf-8",
            )

            self.write_json(
                {
                    "ok": True,
                    "settingsPath": str(target_path),
                    "project": summarize_project(project_path, self.server.strategies_config, self.server.modes_config),
                }
            )
        except ValueError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except OSError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def apply_autostart(self) -> None:
        try:
            payload = self.read_json_body()
            enabled = bool(payload.get("enabled"))
            status = set_autostart_enabled(enabled, self.server.workspace_root, self.server.host, self.server.port)
            self.write_json({"ok": True, "autostart": status})
        except ValueError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except OSError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def cleanup_preview(self) -> None:
        try:
            payload = self.read_json_body()
            audio_url = normalize_optional_text(payload.get("audioUrl"))
            deleted = False
            if audio_url and audio_url.startswith("/api/preview-audio/"):
                encoded_name = audio_url.removeprefix("/api/preview-audio/").split("?", 1)[0]
                target = (PREVIEW_ROOT / unquote(encoded_name).replace("\\", "/")).resolve()
                if is_relative_to(target, PREVIEW_ROOT.resolve()) and target.exists() and target.is_file():
                    target.unlink()
                    deleted = True
            self.write_json({"ok": True, "deleted": deleted})
        except (ValueError, json.JSONDecodeError) as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except OSError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def preview_voice(self) -> None:
        try:
            prune_preview_files()
            payload = self.read_json_body()
            profile_name = normalize_optional_text(payload.get("voiceProfile"))
            custom_voice = sanitize_custom_voice(payload.get("customVoice"))
            if custom_voice and (not profile_name or profile_name == custom_voice.get("profileName")):
                profile_name = custom_voice.get("profileName") or "custom_project_voice"
                profile = custom_voice
            elif not profile_name:
                raise ValueError("voiceProfile is required.")
            else:
                profiles = self.server.modes_config.get("voiceProfiles", {})
                profile = profiles.get(profile_name)
                if profile is None:
                    raise ValueError(f"Unknown voiceProfile: {profile_name}")

            locale = normalized_locale(payload.get("locale"))
            prefer_generated = bool(payload.get("preferGenerated")) or locale != "zh-CN"
            sample_file = normalize_optional_text(profile.get("sampleFile"))
            if sample_file and not prefer_generated:
                sample_path = (REPO_ROOT / sample_file).resolve()
                if sample_path.exists() and is_relative_to(sample_path, SAMPLES_ROOT):
                    sample_url = "/api/sample-audio/" + quote(str(sample_path.relative_to(SAMPLES_ROOT)).replace("\\", "/"))
                    self.write_json({"ok": True, "source": "sample", "audioUrl": sample_url})
                    return

            voice = normalize_optional_text(profile.get("voice"))
            rate = normalize_optional_text(profile.get("rate")) or "+0%"
            pitch = normalize_optional_text(profile.get("pitch")) or "+0Hz"
            text = normalize_optional_text(payload.get("text")) or normalize_optional_text(profile.get("previewText"))
            locale_voice = LOCALE_PREVIEW_VOICES.get(locale)
            if prefer_generated and locale_voice and not custom_voice:
                voice = locale_voice["voice"]
            if not voice:
                raise ValueError(f"voiceProfile has no voice value: {profile_name}")
            if not text:
                text = "Ready when you are."

            PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
            safe_name = "".join(char if char.isalnum() or char in "-_" else "-" for char in profile_name)
            out_path = PREVIEW_ROOT / f"{safe_name}-{int(time.time() * 1000)}.mp3"

            if os.name == "nt":
                command = [
                    "powershell",
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(REPO_ROOT / "scripts" / "say-neural.ps1"),
                    "-Voice",
                    voice,
                    "-Rate",
                    rate,
                    "-Pitch",
                    pitch,
                    "-OutPath",
                    str(out_path),
                    "-NoPlay",
                    "-IgnoreProjectVoiceSettings",
                    "-Text",
                    text,
                ]
            else:
                command = [
                    "bash",
                    str(REPO_ROOT / "scripts" / "say-neural-mac.sh"),
                    "--voice",
                    voice,
                    "--rate",
                    rate,
                    "--pitch",
                    pitch,
                    "--out-path",
                    str(out_path),
                    "--no-play",
                    "--ignore-project-voice-settings",
                    "--text",
                    text,
                ]

            result = subprocess.run(command, cwd=str(REPO_ROOT), capture_output=True, text=True, timeout=90, check=False)
            if result.returncode != 0:
                message = (result.stderr or result.stdout or "voice preview generation failed").strip()
                raise ValueError(message)

            audio_url = "/api/preview-audio/" + quote(out_path.name)
            self.write_json({"ok": True, "source": "generated", "audioUrl": audio_url, "voice": voice, "rate": rate, "pitch": pitch, "locale": locale})
        except ValueError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except (OSError, subprocess.SubprocessError) as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def apply_auto_settings(self) -> None:
        try:
            payload = self.read_json_body()
            overwrite = bool(payload.get("overwrite", False))
            settings_file = str(payload.get("settingsFile") or SETTINGS_FILES[0])
            voice_locale = normalized_locale(payload.get("voiceLocale") or payload.get("locale"))
            if settings_file not in SETTINGS_FILES:
                raise ValueError(f"Unsupported settings file: {settings_file}")

            projects = scan_projects(self.server.workspace_root, self.server.strategies_config, self.server.modes_config)
            written: list[dict[str, Any]] = []
            skipped: list[dict[str, Any]] = []

            for project in projects:
                project_root = Path(project["path"]).resolve()
                if project.get("settingsFile") and not overwrite:
                    skipped.append({"path": str(project_root), "reason": "existing_settings"})
                    continue

                effective = project.get("effective", {})
                settings = build_settings(
                    {
                        "projectTag": effective.get("projectTag"),
                        "voiceLocale": voice_locale,
                        "settingsFile": settings_file,
                    },
                    self.server.strategies_config,
                    self.server.modes_config,
                )
                target_path = project_root / settings_file
                target_path.write_text(
                    json.dumps(settings, ensure_ascii=False, indent=2) + os.linesep,
                    encoding="utf-8",
                )
                written.append({
                    "path": str(target_path),
                    "projectTag": settings.get("projectTag"),
                    "voiceOverride": settings.get("voiceOverride"),
                    "voiceLocale": settings.get("voiceLocale"),
                })

            refreshed = scan_projects(self.server.workspace_root, self.server.strategies_config, self.server.modes_config)
            self.write_json({"ok": True, "written": written, "skipped": skipped, "projects": refreshed})
        except ValueError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except OSError as exc:
            self.write_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        if not body:
            return {}
        return json.loads(body.decode("utf-8"))

    def write_json(self, data: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status.value)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_audio_file(self, root: Path, encoded_relative_path: str) -> None:
        relative_path = unquote(encoded_relative_path.split("?", 1)[0]).replace("\\", "/")
        target = (root / relative_path).resolve()
        if not is_relative_to(target, root.resolve()) or not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND.value)
            return

        content = target.read_bytes()
        self.send_response(HTTPStatus.OK.value)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)

    def serve_static(self) -> None:
        requested = unquote(self.path.split("?", 1)[0]).lstrip("/")
        if not requested:
            requested = "index.html"

        target = (WEB_ROOT / requested).resolve()
        if not is_relative_to(target, WEB_ROOT):
            self.send_error(HTTPStatus.FORBIDDEN.value)
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            self.send_error(HTTPStatus.NOT_FOUND.value)
            return

        content = target.read_bytes()
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        if target.suffix in {".html", ".css", ".js"}:
            content_type += "; charset=utf-8"

        self.send_response(HTTPStatus.OK.value)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[config-ui] {self.address_string()} - {format % args}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Start the Codex Voice Reply configuration UI.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=47321, type=int)
    parser.add_argument("--workspace-root", default=str(REPO_ROOT.parent))
    parser.add_argument("--allow-outside-workspace", action="store_true")
    parser.add_argument("--open", action="store_true", help="Open the UI in the default browser.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    workspace_root = Path(args.workspace_root).expanduser().resolve()
    server = ConfigUiServer((args.host, args.port), workspace_root, args.allow_outside_workspace)
    url = config_ui_url(args.host, args.port)
    print(f"Codex Voice Reply config UI: {url}")
    print(f"Workspace root: {workspace_root}")
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping config UI server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
