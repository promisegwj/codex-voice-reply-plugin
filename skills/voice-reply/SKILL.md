---
name: voice-reply
description: Speak concise Mandarin voice summaries before Codex replies, with project-specific voice strategies, no-voice project settings, Plan-mode turn timing, and Windows/macOS helper scripts.
---

# Voice Reply

Use the bundled helpers to speak Mandarin summaries when voice is enabled for the current project. The default voice profile is `02-anime-soft-loli-character`: `zh-CN-XiaoyiNeural`, rate `+5%`, pitch `+5Hz`. Treat it as a cute fairy-tale/game-character voice only; do not frame it as adult or suggestive.

## Project Strategy

Before speaking, respect project voice settings:

1. Current conversation user override.
2. Project-root `voice-project-settings.json` or `.codex-voice.json`.
3. `project-voice-strategies.json`.
4. Global defaults in `AGENTS.md`.

If the resolved strategy is `voice_disabled`, `modeOverride` is `voice_disabled`, or `suppressAllSpeech` is `true`, do not call any TTS helper. The helper scripts also enforce this guard from the current working directory or a provided `-ProjectRoot` / `--project-root`.

When no explicit profile is passed, neural helpers resolve the voice from `voiceOverride`, then the selected `strategy`. Use distinct project voice profiles when the user wants to recognize the active project by sound.

## Timing

Mandatory speech moments, when voice is enabled:

- Asking for permission, authorization, confirmation, or approval.
- Asking the user to choose the current Plan-mode option.
- Asking the user to decide an unresolved key tradeoff.
- Being blocked and asking the user for help.
- Sending the final written reply for a completed request.

Plan mode must be turn-based: ask one question, speak that current question and its options, wait for the answer, acknowledge it, then move to the next question. Do not batch future questions into one voice message.

For long tasks, speak only at meaningful stage changes or after roughly 30-60 seconds without any user-facing update.

## Commands

Resolve the plugin root as the directory two levels above this `SKILL.md`; scripts live under `scripts/`.

Windows neural helper:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\say-neural.ps1" -Text "这里放要播报的口语化总分总摘要。"
```

Windows SAPI fallback:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\say.ps1" -Voice Huihui -Text "这里放要播报的口语化摘要。"
```

macOS neural helper:

```bash
bash "<plugin-root>/scripts/say-neural-mac.sh" --text "这里放要播报的口语化总分总摘要。"
```

If `edge-tts` is missing on Windows, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\bootstrap.ps1"
```

Keep spoken summaries conversational: result first, then 2-4 key points, then a short next step. Avoid reading long paths, commands, stack traces, or intermediate debugging unless essential.
