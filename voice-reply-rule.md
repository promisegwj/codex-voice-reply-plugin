# Codex voice reply rule

Use this rule in future Codex conversations when voice output is desired.

## Default mode

The default interaction mode is `reserved_partner` / “收敛爱人”: restrained, warm, and concise. It speaks at necessary moments instead of narrating every step.

The default voice profile is `02-anime-soft-loli-character`: `zh-CN-XiaoyiNeural`, rate `+5%`, pitch `+5Hz`. Use it as a cute fairy-tale/game-character voice only; do not frame it as adult, ambiguous, or suggestive.

Mode details live in `voice-interaction-modes.json`. Users may switch modes by saying:

- “切到话牢模式”
- “切到稳重秘书模式”
- “切到收敛爱人模式”
- “切到静默执行模式”
- “切到教学讲解模式”

Modes change timing, frequency, and wording style. They do not change the current default voice profile unless the user asks.

## Project-specific strategy

Different projects may use different reading strategies. Resolve the strategy in this order:

1. Explicit user instruction in the current conversation.
2. `voice-project-settings.json` or `.codex-voice.json` in the current project root.
3. Matching project entry in `project-voice-strategies.json`.
4. The default in `AGENTS.md`.

Use this when the user wants one project to be quiet, another to be more explanatory, or a voice-lab project to focus on sample comparison.

If the resolved strategy is `voice_disabled` or has `suppressAllSpeech: true`, do not call any TTS helper in that project, including mandatory speech moments and final reply summaries.

Old conversations may still speak because they may have loaded previous instructions into their active context before the project-level no-voice file existed. New or reloaded conversations should honor `voice-project-settings.json` and the project `AGENTS.md`.

The helper scripts perform a project-settings guard before generating audio. They search from the current working directory, or a provided `-ProjectRoot` / `--project-root`, upward for `voice-project-settings.json` or `.codex-voice.json`; `suppressAllSpeech: true`, `strategy: "voice_disabled"`, or `modeOverride: "voice_disabled"` causes a silent exit.

When no explicit profile is passed, neural helpers resolve the default voice from `voiceOverride` first, then from the selected project `strategy`. Use distinct project voice profiles when the user wants to recognize the active project by sound.

## Concurrent playback

Voice scripts must avoid overlapping audio across simultaneous Codex conversations. The provided helpers use a temp-file playback lock named `codex-voice-playback.lock`; if another conversation is already speaking, the next one waits instead of playing over it. Generated audio names include milliseconds and process id to avoid output collisions.

## macOS support

On macOS, prefer `say-neural-mac.sh`:

```bash
bash "/path/to/codex-voice-reply-plugin/say-neural-mac.sh" --voice "zh-CN-XiaoyiNeural" --rate "+5%" --pitch "+5Hz" --text "这里放要播报的口语化总分总摘要。"
```

PowerShell users can also run `say-neural.ps1` under `pwsh`; it now checks `.venv/bin/edge-tts` and macOS players. Do not use the Windows SAPI fallback `say.ps1` on macOS.

The macOS shell helper supports the same profile names as `say-neural.ps1`, including the default `soft_loli_character`.

## Mandatory speech moments

Always speak before sending text/options when the assistant is:

- Asking for permission, authorization, confirmation, or approval.
- Asking the user to choose the current option in Plan mode.
- Asking the user to decide a key tradeoff that cannot be inferred.
- Blocked and asking the user for help.
- Sending the final written reply for a completed request.

## Timing rule

Speak only when it is the assistant's turn and the user needs to respond now, or when the user needs the current result. Do not batch future questions into one voice message. Do not read several upcoming choices before the user has answered the current one.

In Plan mode, use “一问一播一答一推进”:

- Ask one choice question at a time.
- Speak the current question and its options first.
- Then show that one question.
- After the user answers, briefly acknowledge the choice.
- Only then move to the next question.

For long tasks, use stage + time updates: speak at meaningful stage changes, and optionally give a short progress update after about 30-60 seconds without any user-facing update.

## Final reply summary

After finishing reasoning/work for a user request, before sending the final text reply, run the local TTS helper to speak a short Mandarin voice summary.

The voice summary should:

- Be conversational and concise.
- Use a conclusion-first structure: result first, then 2-4 ordered points, then a short closing/next step.
- Cover the real result, not intermediate debugging chatter.
- Mention what was completed, what remains uncertain, and the recommended next step when relevant.
- Avoid reading file paths, commands, or long technical details unless they are essential.

Then send the normal written response with details the user may want to reread.

## TTS command

Preferred neural voice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say-neural.ps1" -Voice "zh-CN-XiaoyiNeural" -Rate "+5%" -Pitch "+5Hz" -Text "这里放要播报的口语化总分总摘要。"
```

Fallback Windows voice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\say.ps1" -Voice Huihui -Device Realtek -Text "这里放要播报的口语化总分总摘要。"
```

## Short prompt for a new conversation

请按我的语音交互规则工作：默认使用“收敛爱人”模式，默认声音采用 `02-anime-soft-loli-character`（`zh-CN-XiaoyiNeural`，语速 `+5%`，音高 `+5Hz`），克制但不断联。凡是请求我授权、允许、确认，或者在 Plan 模式里让我选择当前选项，都必须先调用仓库根目录下的 `say-neural.ps1` 播报，再发送文字或展示选项。Plan 模式必须一问一播一答一推进，不要一次性读完多个后续问题。长任务按阶段和 30 到 60 秒无更新的时间点简短播报。准备正式回复前，也要用“总分总”播报一个中文口语化结果摘要；如果神经网络语音失败，再调用仓库根目录下的 `say.ps1`。
