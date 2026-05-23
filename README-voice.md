# Advanced Voice Configuration

This is the detailed reference for voice behavior after the plugin is installed. For first-time setup, installation commands, and the copy-paste Codex prompt, start with `README.md`.

Use this file when you want to tune interaction modes, project-level strategies, no-voice behavior, concurrent playback, macOS support, or voice sample profiles.

There are two main voice helpers in this repository:

## Interaction modes

The default voice interaction mode is `reserved_partner` / “收敛爱人”. It is restrained, warm, and concise: it speaks when the user needs to respond, when a task is blocked, at meaningful long-task stage changes, and before the final written reply.

The default voice profile is `02-anime-soft-loli-character`: `zh-CN-XiaoyiNeural`, rate `+5%`, pitch `+5Hz`. Treat it as a cute fairy-tale/game-character voice, not an adult or suggestive persona. The old A3-v3 profile remains available as a fallback/reference.

Available modes are defined in `voice-interaction-modes.json`:

- `chatty_companion` / 话牢模式: more process narration and stronger companionship.
- `steady_secretary` / 稳重秘书模式: balanced status updates at necessary work milestones.
- `reserved_partner` / 收敛爱人模式: the default, quiet and high-signal.
- `silent_executor` / 静默执行模式: minimal speech except required confirmations and final summaries.
- `teaching_narrator` / 教学讲解模式: explains key reasoning and tradeoffs during complex work.

Users can switch modes by saying “切到话牢模式”, “切到稳重秘书模式”, “切到收敛爱人模式”, “切到静默执行模式”, or “切到教学讲解模式”.

Mandatory speech moments are the same in every mode: permission/approval requests, Plan-mode current choices, key unresolved tradeoffs, blocked requests for help, and final written replies.

Plan mode should be turn-based: ask one question, speak that one question and its options, wait for the user's answer, acknowledge it, then move to the next question. Do not speak several future questions in one batch.

## Project strategies

Different workspaces can use different reading strategies. Strategy resolution order:

1. The user's explicit instruction in the current conversation.
2. `voice-project-settings.json` or `.codex-voice.json` in the current project root.
3. A matching entry in `project-voice-strategies.json`.
4. The default mode in `AGENTS.md`.

Project strategies are useful when one project needs quiet execution, another needs teaching-style narration, and this voice lab needs more sample-oriented explanations.

Use the `voice_disabled` strategy when a project should never speak. That strategy suppresses all TTS calls, including mandatory confirmations, Plan-mode choices, and final summaries.

Existing conversations may keep speaking if they loaded older instructions before the no-voice rule was written. Open a new conversation in that project, or explicitly say “本项目禁用语音，重新读取 voice-project-settings.json / AGENTS.md”, so the active context sees the new rule.

For a project that should stay silent, add a project-root `voice-project-settings.json` with the `voice_disabled` strategy. Keep machine-specific project names in local settings rather than publishing them in the shared strategy file.

The helper scripts also check the current working directory, or a `-ProjectRoot` / `--project-root` argument, for `voice-project-settings.json` or `.codex-voice.json`. If the file contains `suppressAllSpeech: true`, `strategy: "voice_disabled"`, or `modeOverride: "voice_disabled"`, the script exits without generating or playing audio. Use `-IgnoreProjectVoiceSettings` / `--ignore-project-voice-settings` only for intentional testing.

If no explicit `-Profile` / `--profile` is passed, the neural helpers also resolve project voices from `voiceOverride` or the selected `strategy`. This lets different projects use different default voices so the user can identify the active project by sound.

Suggested project voice identities:

- `project-voice-lab-cute`: voice sample lab / playful character sound.
- `project-coding-professional`: coding project / steady male voice.
- `project-product-warm`: product design project / warm female voice.
- `project-learning-narrator`: learning project / relaxed narration.

## Concurrent conversations

The TTS helpers serialize playback with a machine-level temp-file lock named `codex-voice-playback.lock`. This prevents two Codex conversations from speaking over each other.

Generated filenames now include milliseconds and the process id, so simultaneous generations do not overwrite each other. If the playback lock cannot be acquired within 300 seconds, the script keeps the generated audio file and skips playback instead of overlapping audio.

## macOS support

For macOS, use the shell helper:

```bash
bash "/path/to/codex-voice-reply-plugin/say-neural-mac.sh" --voice "zh-CN-XiaoyiNeural" --rate "+5%" --pitch "+5Hz" --text "这里放要播报的口语化总分总摘要。"
```

The macOS helper uses `.venv/bin/edge-tts` or `edge-tts` on PATH, then plays with `afplay` when available. It supports the same profile names as `say-neural.ps1`, for example `--profile soft_loli_character`, and uses the same playback lock idea as the PowerShell helper.

If you use PowerShell on macOS, `say-neural.ps1` also looks for `.venv/bin/edge-tts` and command-line players such as `afplay`, `ffplay`, `mpg123`, or `mpv`.

## Character sample catalog

Voice sample directions are defined in `voice-sample-catalog.json`. It includes anime-style voices such as 元气二次元少女、萌系少女/萝莉感角色音、温柔御姐、清冷御姐、青音少年 and 清爽青年男声.

When the user asks for these samples, first list the candidate style, use case, voice/profile, rate, pitch, and sample copy direction. Generate MP3 files only after the user confirms which samples to create.

The 萝莉/幼态角色 direction is treated as a cute, fairy-tale, game-character voice only, without adult or suggestive framing.

## Preferred: neural voice

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say-neural.ps1" -Voice "zh-CN-XiaoyiNeural" -Rate "+5%" -Pitch "+5Hz" -Text "这里放要播报的口语化总分总摘要。"
```

Profiles:

- `soft_loli_character`: `zh-CN-XiaoyiNeural`, default cute game-character voice.
- `project-voice-lab-cute`: `zh-CN-XiaoyiNeural`, voice-lab identity.
- `project-coding-professional`: `zh-CN-YunyangNeural`, coding-project identity.
- `project-product-warm`: `zh-CN-XiaoxiaoNeural`, product-design identity.
- `project-learning-narrator`: `zh-CN-YunxiNeural`, learning/narration identity.
- `warm`: `zh-CN-XiaoxiaoNeural`, warm female voice.
- `lively`: `zh-CN-XiaoyiNeural`, livelier female voice.
- `sunshine`: `zh-CN-YunxiNeural`, lively male voice.
- `professional`: `zh-CN-YunyangNeural`, professional male news voice.
- `passion`: `zh-CN-YunjianNeural`, energetic male voice.
- `bright`: `zh-CN-shaanxi-XiaoniNeural`, bright regional female voice.
- `podcast`: `zh-CN-XiaoxiaoNeural`, slower and lower warm podcast narration.
- `detective`: `zh-CN-YunyangNeural`, slower and lower investigative narration.
- `narrator`: `zh-CN-YunxiNeural`, slower and lower relaxed male narration.

Useful options:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say-neural.ps1" -ListVoices
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say-neural.ps1" -Profile professional -Rate "-4%" -Pitch "-1Hz" -Text "语速更稳一点。"
```

## Fallback: Windows local voice

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say.ps1" -Voice Huihui -Device Realtek -Text "这里放要播报的口语化摘要。"
```

The Windows local voice is more reliable offline, but it has fewer voice and personality options.
