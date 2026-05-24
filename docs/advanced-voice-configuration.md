# Advanced Voice Configuration

This is the detailed reference for voice behavior after the plugin is installed. For first-time setup, installation commands, and the copy-paste Codex prompt, start with `README.md`.

Use this file when you want to tune interaction modes, project-level strategies, no-voice behavior, concurrent playback, macOS support, or voice sample profiles.

There are two main voice helpers in this repository:

## Interaction modes

The default voice interaction mode is `reserved_partner` / “收敛爱人”. It is restrained, warm, and concise: it speaks when the user needs to respond, when a task is blocked, at meaningful long-task stage changes, and before the final written reply.

The default voice profile is `02-anime-soft-loli-character`: `zh-CN-XiaoyiNeural`, rate `+5%`, pitch `+5Hz`. Treat it as a cute fairy-tale/game-character voice, not an adult or suggestive persona. The old A3-v3 profile remains available as a fallback/reference.

Available modes are defined in `voice-interaction-modes.json`:

- `chatty_companion` / 话痨模式: more process narration and stronger companionship.
- `steady_secretary` / 稳重秘书模式: balanced status updates at necessary work milestones.
- `reserved_partner` / 收敛爱人模式: the default, quiet and high-signal.
- `silent_executor` / 静默执行模式: minimal speech except required confirmations and final summaries.
- `teaching_narrator` / 教学讲解模式: explains key reasoning and tradeoffs during complex work.

Users can switch modes by saying “切到话痨模式”, “切到稳重秘书模式”, “切到收敛爱人模式”, “切到静默执行模式”, or “切到教学讲解模式”.

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

If no explicit `-Profile` / `--profile` is passed, the neural helpers also resolve project voices from `voiceOverride` or the selected `strategy`. If the project settings include `voiceLocale`, the helpers use a matching edge-tts voice for English, French, Japanese, or Korean without adding extra bundled sample files. This lets different projects use different default voices and languages so the user can identify the active project by sound.

Suggested project voice identities:

- `project-voice-lab-cute`: lively chatty character sound.
- `project-coding-professional`: coding project / steady male voice.
- `project-product-warm`: product design project / warm female voice.
- `project-learning-narrator`: learning project / relaxed narration.

Project voice modes are the user-facing preset layer for the configuration UI. The stored field is still `projectTag` for backward compatibility, but the UI treats it as a complete mode: it maps a project type to the underlying strategy, mode override, default voice profile, identity label, and silence flag. Current modes are:

- `default_reserved`: light companion behavior with low-frequency speech.
- `voice_lab_cute`: lively chatty behavior; shown as “活泼小话痨” in the UI.
- `coding_quiet`: quiet execution behavior with a steady male voice.
- `product_warm`: milestone reporting behavior with a warm female voice.
- `learning_narrator`: teaching/explainer behavior with relaxed narration.
- `silent_project`: project-level no-voice behavior.

The helper scripts also understand these modes. If a project settings file contains `projectTag` but no explicit `voiceOverride`, the neural helper resolves the default voice from the mode. `silent_project` suppresses playback even if the rest of the file is minimal.

## Configuration UI

The repository includes a local web UI for project voice settings. It scans a Codex workspace, shows projects with existing settings, and writes the selected project tag, strategy, mode override, voice profile, identity label, voice locale, and silence flag back to the selected project.

The UI has a language selector for Simplified Chinese, English, French, Japanese, and Korean. Localization changes the displayed labels, helper text, messages, mode cards, details table, preview language, generated custom-voice locale, and stored `voiceLocale`; stored configuration keys remain stable.

Project voice modes are displayed as clickable cards. Choosing a card updates the hidden strategy/mode fields and voice preview immediately; users do not choose strategy and mode override separately. For projects without a local settings file, the server can auto-assign a mode: it first checks configured keyword rules, then falls back to a stable hash of the project path so different projects tend to get different default voices. The UI's “自动写入配置” area lets users choose “给尚未配置的项目根据项目特性自动配置” for missing settings only, or “给所有项目按照项目特性自动配置” to rewrite every listed project with the current automatic rules.

The default URL is stable: `http://127.0.0.1:47321/`. The server is local and does not survive a Codex app or machine restart unless the user starts it again or enables the UI's “固定地址” option. The user-facing promise is simple: after enabling it, the machine keeps the configuration page address fixed when Codex starts. The implementation registers a current-user local service entry and does not modify the Codex app itself.

The voice selector has a preview button. The UI sends the current locale and a voice-personality slogan to the local server, which generates a temporary preview under `out/config-ui-previews/`. Preview length is adaptive: chatty, energetic, or teaching voices can say a little more, while steady or quiet voices stay shorter. The preview uses the selected UI language instead of replaying longer Chinese sample files; non-Chinese languages use one generated voice per locale rather than a prebuilt sample matrix.

The UI can also generate a project-level `customVoice` draft from a user-provided name and preference prompt. This is not voice cloning or model training; it maps the prompt to an available edge-tts voice plus rate, pitch, label, style, and preview slogan. Generation is temporary: the named custom voice only appears in the Default Voice selector after the user clicks Save to Project. Unsaved preview drafts are cleaned up on ordinary config submission or page exit. When written to `voice-project-settings.json`, the Windows and macOS helpers prefer `customVoice.voice`, `customVoice.rate`, and `customVoice.pitch` over the normal profile resolution.

Prompts that mention aged, elderly, weathered, hoarse, husky, or slow female voices map to a slower, lower-pitched female approximation. This remains constrained by available edge-tts voices; it does not create a true hoarse or elderly cloned voice.

Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\start-config-ui.ps1" -Open
```

macOS:

```bash
bash "./scripts/start-config-ui.sh" --open
```

The UI is served from `web/config-ui/`. The local server API is implemented by `scripts/start-config-ui.py`, so submitting the form writes real project settings instead of only generating a JSON snippet. By default it scans the parent directory of this repository as the workspace root. Pass `-WorkspaceRoot` on Windows or `--workspace-root` on macOS to point it at another Codex workspace.

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
- `project-voice-lab-cute`: `zh-CN-XiaoyiNeural`, lively chatty character identity.
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
