---
name: voice-reply
description: Speak concise Mandarin voice summaries before Codex sends final written replies. Use when the user wants spoken replies, audio summaries, Chinese TTS, voice feedback, read-aloud answers, voice samples, or a Codex conversation that should summarize the result aloud before the text answer.
---

# Voice Reply

## Overview

Use the bundled PowerShell helpers to speak a short Mandarin summary before sending the normal final text response. The default voice baseline is A3-v3: `zh-CN-XiaoxiaoNeural`, rate `+7%`, pitch `-1Hz`.

## Reply Workflow

1. Finish the user's requested reasoning, inspection, edits, or checks first.
2. Before the final written response, compose a spoken Mandarin summary using a conclusion-detail-conclusion shape:
   - one sentence with the result
   - 2 to 4 short points about completed work, evidence, caveats, or next steps
   - one closing sentence with the recommended next action
3. Speak that summary with the neural helper when available.
4. If the neural helper fails, speak the same summary with the Windows SAPI fallback.
5. Send the normal written final response after the audio step.

Keep the spoken summary conversational. Do not primarily read intermediate debugging, long paths, commands, or stack traces unless they are the important result.

## Commands

Resolve the plugin root as the directory two levels above this `SKILL.md`; the scripts live in `scripts/` under that root.

Preferred neural voice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\say-neural.ps1" -Voice "zh-CN-XiaoxiaoNeural" -Rate "+7%" -Pitch "-1Hz" -Text "Put the concise spoken Mandarin summary here."
```

Fallback Windows voice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\say.ps1" -Voice Huihui -Text "Put the concise spoken Mandarin summary here."
```

If `say-neural.ps1` reports that `edge-tts` is missing, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<plugin-root>\scripts\bootstrap.ps1"
```

## Defaults

- Default neural voice: `zh-CN-XiaoxiaoNeural`
- Default rate: `+7%`
- Default pitch: `-1Hz`
- Default output folder: `<plugin-root>\out`
- Default behavior: speak the audio and print the generated MP3 path
