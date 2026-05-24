#!/usr/bin/env bash
set -euo pipefail

VOICE="zh-CN-XiaoyiNeural"
RATE="+5%"
PITCH="+5Hz"
VOLUME="+0%"
PROFILE="soft_loli_character"
OUT_PATH=""
NO_PLAY=0
LIST_VOICES=0
LOCK_TIMEOUT_SECONDS=300
TEXT_PARTS=()
PROJECT_ROOT=""
IGNORE_PROJECT_VOICE_SETTINGS=0
PROFILE_EXPLICIT=0
VOICE_EXPLICIT=0
CUSTOM_VOICE_ACTIVE=0

apply_profile() {
  case "$1" in
    soft_loli_character)
      VOICE="zh-CN-XiaoyiNeural"
      RATE="+5%"
      PITCH="+5Hz"
      ;;
    02-anime-soft-loli-character)
      VOICE="zh-CN-XiaoyiNeural"
      RATE="+5%"
      PITCH="+5Hz"
      ;;
    A1-relaxed-female-explainer)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="-5%"
      PITCH="-1Hz"
      ;;
    A3-v2-gentle-companion-lighter)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+5%"
      PITCH="+0Hz"
      ;;
    A3-v3)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+7%"
      PITCH="-1Hz"
      ;;
    A5-casual-female-voiceover)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+3%"
      PITCH="+1Hz"
      ;;
    01-anime-genki-heroine)
      VOICE="zh-CN-XiaoyiNeural"
      RATE="+8%"
      PITCH="+3Hz"
      ;;
    03-anime-sweet-idol)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+6%"
      PITCH="+2Hz"
      ;;
    04-anime-cool-senior-sister)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="-3%"
      PITCH="-3Hz"
      ;;
    05-anime-warm-senior-sister)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="-1%"
      PITCH="-2Hz"
      ;;
    06-anime-youth-qingyin)
      VOICE="zh-CN-YunxiNeural"
      RATE="+5%"
      PITCH="+2Hz"
      ;;
    07-anime-clean-young-male)
      VOICE="zh-CN-YunxiNeural"
      RATE="+1%"
      PITCH="+0Hz"
      ;;
    project-voice-lab-cute)
      VOICE="zh-CN-XiaoyiNeural"
      RATE="+5%"
      PITCH="+5Hz"
      ;;
    project-coding-professional)
      VOICE="zh-CN-YunyangNeural"
      RATE="-2%"
      PITCH="-1Hz"
      ;;
    project-product-warm)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+0%"
      PITCH="+0Hz"
      ;;
    project-learning-narrator)
      VOICE="zh-CN-YunxiNeural"
      RATE="-6%"
      PITCH="-2Hz"
      ;;
    warm)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="+0%"
      PITCH="+0Hz"
      ;;
    lively)
      VOICE="zh-CN-XiaoyiNeural"
      RATE="+6%"
      PITCH="+2Hz"
      ;;
    sunshine)
      VOICE="zh-CN-YunxiNeural"
      RATE="+3%"
      PITCH="+0Hz"
      ;;
    professional)
      VOICE="zh-CN-YunyangNeural"
      RATE="-2%"
      PITCH="-1Hz"
      ;;
    passion)
      VOICE="zh-CN-YunjianNeural"
      RATE="+4%"
      PITCH="+0Hz"
      ;;
    bright)
      VOICE="zh-CN-shaanxi-XiaoniNeural"
      RATE="+5%"
      PITCH="+2Hz"
      ;;
    podcast)
      VOICE="zh-CN-XiaoxiaoNeural"
      RATE="-5%"
      PITCH="-2Hz"
      ;;
    detective)
      VOICE="zh-CN-YunyangNeural"
      RATE="-7%"
      PITCH="-3Hz"
      ;;
    narrator)
      VOICE="zh-CN-YunxiNeural"
      RATE="-6%"
      PITCH="-2Hz"
      ;;
    *)
      echo "Unknown profile: $1" >&2
      exit 2
      ;;
  esac
}

timestamp_for_filename() {
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
from datetime import datetime
print(datetime.now().strftime("%Y%m%d-%H%M%S%f")[:-3])
PY
  else
    date +%Y%m%d-%H%M%S
  fi
}

settings_disable_voice() {
  local start_path="$1"

  if [[ -z "$start_path" ]]; then
    start_path="$PWD"
  fi

  if [[ -f "$start_path" ]]; then
    start_path="$(dirname "$start_path")"
  fi

  local directory
  directory="$(cd "$start_path" 2>/dev/null && pwd || true)"
  if [[ -z "$directory" ]]; then
    return 1
  fi

  while [[ "$directory" != "/" && -n "$directory" ]]; do
    for settings_file in "voice-project-settings.json" ".codex-voice.json"; do
      local settings_path="$directory/$settings_file"
      if [[ -f "$settings_path" ]]; then
        if grep -Eq '"suppressAllSpeech"[[:space:]]*:[[:space:]]*true|"strategy"[[:space:]]*:[[:space:]]*"voice_disabled"|"modeOverride"[[:space:]]*:[[:space:]]*"voice_disabled"|"projectTag"[[:space:]]*:[[:space:]]*"silent_project"' "$settings_path"; then
          return 0
        fi
      fi
    done
    directory="$(dirname "$directory")"
  done

  return 1
}

settings_voice_profile() {
  local start_path="$1"

  if [[ -z "$start_path" ]]; then
    start_path="$PWD"
  fi

  if [[ -f "$start_path" ]]; then
    start_path="$(dirname "$start_path")"
  fi

  local directory
  directory="$(cd "$start_path" 2>/dev/null && pwd || true)"
  if [[ -z "$directory" ]]; then
    return 1
  fi

  while [[ "$directory" != "/" && -n "$directory" ]]; do
    for settings_file in "voice-project-settings.json" ".codex-voice.json"; do
      local settings_path="$directory/$settings_file"
      if [[ -f "$settings_path" ]]; then
        local voice_override
        voice_override="$(grep -Eo '"voiceOverride"[[:space:]]*:[[:space:]]*"[^"]+"' "$settings_path" | head -n 1 | sed -E 's/.*"voiceOverride"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
        if [[ -n "$voice_override" && "$voice_override" != "null" ]]; then
          echo "$voice_override"
          return 0
        fi

        local project_tag
        project_tag="$(grep -Eo '"projectTag"[[:space:]]*:[[:space:]]*"[^"]+"' "$settings_path" | head -n 1 | sed -E 's/.*"projectTag"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
        case "$project_tag" in
          default_reserved)
            echo "02-anime-soft-loli-character"
            return 0
            ;;
          voice_lab_cute)
            echo "project-voice-lab-cute"
            return 0
            ;;
          coding_quiet)
            echo "project-coding-professional"
            return 0
            ;;
          product_warm)
            echo "project-product-warm"
            return 0
            ;;
          learning_narrator)
            echo "project-learning-narrator"
            return 0
            ;;
        esac

        local strategy
        strategy="$(grep -Eo '"strategy"[[:space:]]*:[[:space:]]*"[^"]+"' "$settings_path" | head -n 1 | sed -E 's/.*"strategy"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
        case "$strategy" in
          voice_lab)
            echo "project-voice-lab-cute"
            return 0
            ;;
          coding_focus)
            echo "project-coding-professional"
            return 0
            ;;
          product_design)
            echo "project-product-warm"
            return 0
            ;;
          learning_mode)
            echo "project-learning-narrator"
            return 0
            ;;
          reserved_partner_default)
            echo "02-anime-soft-loli-character"
            return 0
            ;;
        esac
      fi
    done
    directory="$(dirname "$directory")"
  done

  return 1
}

settings_custom_voice() {
  local start_path="$1"

  if [[ -z "$start_path" ]]; then
    start_path="$PWD"
  fi

  if [[ -f "$start_path" ]]; then
    start_path="$(dirname "$start_path")"
  fi

  local directory
  directory="$(cd "$start_path" 2>/dev/null && pwd || true)"
  if [[ -z "$directory" ]]; then
    return 1
  fi

  while [[ "$directory" != "/" && -n "$directory" ]]; do
    for settings_file in "voice-project-settings.json" ".codex-voice.json"; do
      local settings_path="$directory/$settings_file"
      if [[ -f "$settings_path" ]] && command -v python3 >/dev/null 2>&1; then
        python3 - "$settings_path" <<'PY'
import json
import sys

try:
    data = json.load(open(sys.argv[1], encoding="utf-8"))
except Exception:
    sys.exit(1)

custom = data.get("customVoice") or {}
voice = str(custom.get("voice") or "").strip()
if not voice:
    sys.exit(1)

rate = str(custom.get("rate") or "+0%").strip()
pitch = str(custom.get("pitch") or "+0Hz").strip()
print("\t".join([voice, rate, pitch]))
PY
        return_code=$?
        if [[ "$return_code" -eq 0 ]]; then
          return 0
        fi
      fi
    done
    directory="$(dirname "$directory")"
  done

  return 1
}

settings_voice_locale() {
  local start_path="$1"

  if [[ -z "$start_path" ]]; then
    start_path="$PWD"
  fi

  if [[ -f "$start_path" ]]; then
    start_path="$(dirname "$start_path")"
  fi

  local directory
  directory="$(cd "$start_path" 2>/dev/null && pwd || true)"
  if [[ -z "$directory" ]]; then
    return 1
  fi

  while [[ "$directory" != "/" && -n "$directory" ]]; do
    for settings_file in "voice-project-settings.json" ".codex-voice.json"; do
      local settings_path="$directory/$settings_file"
      if [[ -f "$settings_path" ]] && command -v python3 >/dev/null 2>&1; then
        python3 - "$settings_path" <<'PY'
import json
import sys

try:
    data = json.load(open(sys.argv[1], encoding="utf-8"))
except Exception:
    sys.exit(1)

custom = data.get("customVoice") or {}
locale = str(custom.get("locale") or data.get("voiceLocale") or data.get("locale") or "").strip()
if not locale:
    sys.exit(1)

if locale.lower().startswith("zh"):
    print("zh-CN")
else:
    base = locale.split("-", 1)[0].lower()
    if base in {"en", "fr", "ja", "ko"}:
        print(base)
    else:
        sys.exit(1)
PY
        return_code=$?
        if [[ "$return_code" -eq 0 ]]; then
          return 0
        fi
      fi
    done
    directory="$(dirname "$directory")"
  done

  return 1
}

localized_voice_for_locale() {
  local locale="$1"
  local fallback_voice="$2"
  case "$locale" in
    en)
      echo "en-US-JennyNeural"
      ;;
    fr)
      echo "fr-FR-DeniseNeural"
      ;;
    ja)
      echo "ja-JP-NanamiNeural"
      ;;
    ko)
      echo "ko-KR-SunHiNeural"
      ;;
    *)
      echo "$fallback_voice"
      ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -Profile|--profile)
      PROFILE="$2"
      PROFILE_EXPLICIT=1
      apply_profile "$PROFILE"
      shift 2
      ;;
    -Voice|--voice)
      VOICE="$2"
      VOICE_EXPLICIT=1
      shift 2
      ;;
    -Rate|--rate)
      RATE="$2"
      shift 2
      ;;
    -Pitch|--pitch)
      PITCH="$2"
      shift 2
      ;;
    -Volume|--volume)
      VOLUME="$2"
      shift 2
      ;;
    -OutPath|--out-path)
      OUT_PATH="$2"
      shift 2
      ;;
    -Text|--text)
      TEXT_PARTS+=("$2")
      shift 2
      ;;
    -NoPlay|--no-play)
      NO_PLAY=1
      shift
      ;;
    -ListVoices|--list-voices)
      LIST_VOICES=1
      shift
      ;;
    -PlaybackLockTimeoutSeconds|--playback-lock-timeout-seconds)
      LOCK_TIMEOUT_SECONDS="$2"
      shift 2
      ;;
    -ProjectRoot|--project-root)
      PROJECT_ROOT="$2"
      shift 2
      ;;
    -IgnoreProjectVoiceSettings|--ignore-project-voice-settings)
      IGNORE_PROJECT_VOICE_SETTINGS=1
      shift
      ;;
    *)
      TEXT_PARTS+=("$1")
      shift
      ;;
  esac
done

if [[ "$IGNORE_PROJECT_VOICE_SETTINGS" -eq 0 ]] && settings_disable_voice "$PROJECT_ROOT"; then
  exit 0
fi

VOICE_LOCALE=""
if [[ "$IGNORE_PROJECT_VOICE_SETTINGS" -eq 0 ]]; then
  VOICE_LOCALE="$(settings_voice_locale "$PROJECT_ROOT" || true)"
fi

if [[ "$IGNORE_PROJECT_VOICE_SETTINGS" -eq 0 && "$PROFILE_EXPLICIT" -eq 0 ]]; then
  if custom_voice_values="$(settings_custom_voice "$PROJECT_ROOT")"; then
    IFS=$'\t' read -r VOICE RATE PITCH <<< "$custom_voice_values"
    CUSTOM_VOICE_ACTIVE=1
  elif resolved_profile="$(settings_voice_profile "$PROJECT_ROOT")"; then
    PROFILE="$resolved_profile"
    apply_profile "$PROFILE"
  fi
fi

if [[ "$IGNORE_PROJECT_VOICE_SETTINGS" -eq 0 && "$VOICE_EXPLICIT" -eq 0 && "$CUSTOM_VOICE_ACTIVE" -eq 0 && -n "${VOICE_LOCALE:-}" ]]; then
  VOICE="$(localized_voice_for_locale "$VOICE_LOCALE" "$VOICE")"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$(basename "$SCRIPT_DIR")" == "scripts" ]]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  REPO_ROOT="$SCRIPT_DIR"
fi

if [[ -x "$REPO_ROOT/.venv/bin/edge-tts" ]]; then
  EDGE_TTS="$REPO_ROOT/.venv/bin/edge-tts"
elif command -v edge-tts >/dev/null 2>&1; then
  EDGE_TTS="$(command -v edge-tts)"
else
  echo "edge-tts is not installed in .venv or on PATH." >&2
  exit 1
fi

if [[ "$LIST_VOICES" -eq 1 ]]; then
  "$EDGE_TTS" --list-voices | grep 'zh-CN' || true
  exit 0
fi

MESSAGE="${TEXT_PARTS[*]}"
if [[ -z "${MESSAGE// }" ]]; then
  exit 0
fi

if [[ -z "$OUT_PATH" ]]; then
  mkdir -p "$REPO_ROOT/out"
  OUT_PATH="$REPO_ROOT/out/codex-voice-$(timestamp_for_filename)-$$.mp3"
fi

mkdir -p "$(dirname "$OUT_PATH")"

"$EDGE_TTS" \
  --text "$MESSAGE" \
  --voice "$VOICE" \
  "--rate=$RATE" \
  "--pitch=$PITCH" \
  "--volume=$VOLUME" \
  --write-media "$OUT_PATH"

echo "$OUT_PATH"

if [[ "$NO_PLAY" -eq 1 ]]; then
  exit 0
fi

LOCK_DIR="${TMPDIR:-/tmp}/codex-voice-playback.lockdir"
START_SECONDS="$(date +%s)"
while ! mkdir "$LOCK_DIR" 2>/dev/null; do
  NOW_SECONDS="$(date +%s)"
  if (( NOW_SECONDS - START_SECONDS >= LOCK_TIMEOUT_SECONDS )); then
    echo "Could not acquire Codex voice playback lock within ${LOCK_TIMEOUT_SECONDS} seconds; skipping playback." >&2
    exit 0
  fi
  sleep 0.2
done

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

if command -v afplay >/dev/null 2>&1; then
  afplay "$OUT_PATH"
elif command -v ffplay >/dev/null 2>&1; then
  ffplay -nodisp -autoexit -loglevel quiet "$OUT_PATH"
elif command -v mpg123 >/dev/null 2>&1; then
  mpg123 -q "$OUT_PATH"
elif command -v mpv >/dev/null 2>&1; then
  mpv --really-quiet --no-video "$OUT_PATH"
else
  open "$OUT_PATH"
fi
