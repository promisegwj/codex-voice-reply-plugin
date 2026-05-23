# Security Policy

## Supported Versions

Security fixes are handled on the default branch of this repository.

## Reporting a Vulnerability

Please do not publish sensitive security details in a public issue. Use GitHub's private vulnerability reporting flow if it is available for this repository, or contact the maintainer through GitHub.

Include:

- affected file or script
- operating system
- steps to reproduce
- whether any token, private path, or generated audio file may have been exposed

## Privacy Notes

This project is designed to avoid committing local runtime data:

- `.venv/` and `out/` are ignored.
- Project-specific silence or voice rules should live in local `voice-project-settings.json` or `.codex-voice.json` when they contain private project names.
- Do not commit API keys, GitHub tokens, `.env*` files, private paths, or generated logs.

`say-neural.ps1` and `say-neural-mac.sh` use `edge-tts`, which requires network access to Microsoft Edge online voices. Use the local Windows SAPI fallback only when neural voice output is not required.
