# Contributing

Thanks for helping improve Codex Voice Reply Plugin.

## Local Setup

```powershell
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\bootstrap.ps1"
```

For macOS:

```bash
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
python3 -m venv .venv
./.venv/bin/python -m pip install -U pip
./.venv/bin/python -m pip install -r requirements.txt
```

## Validation

Before opening a pull request, run the checks that match your change:

```powershell
Get-Content -Raw -Encoding UTF8 .\voice-interaction-modes.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 .\project-voice-strategies.json | ConvertFrom-Json | Out-Null
$null = [scriptblock]::Create((Get-Content -Raw -Encoding UTF8 .\scripts\say-neural.ps1))
$null = [scriptblock]::Create((Get-Content -Raw -Encoding UTF8 .\scripts\say.ps1))
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -Profile soft_loli_character -Text "验证语音生成。" -NoPlay
```

Also scan for accidental local/private data before publishing:

- placeholder GitHub URLs
- machine-specific absolute paths
- private project names
- credentials, token-like strings, private-key headers, and `.env*` files

Keep the exact scanning pattern in your local release checklist rather than committing real-looking token patterns into the docs.

## Pull Requests

- Keep changes focused and explain the user-facing behavior.
- Do not commit `.venv/`, `out/`, `.env*`, logs, or generated scratch files.
- Keep machine-specific project rules in local `voice-project-settings.json` or `.codex-voice.json`; do not publish private project names in shared config.
- Use draft PRs for behavior changes that need voice or macOS validation.
