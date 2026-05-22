# Codex Voice Reply Plugin

A small Codex plugin and skill for speaking concise Mandarin voice summaries before the final written reply.

The default voice baseline is **A3-v3**:

- Voice: `zh-CN-XiaoxiaoNeural`
- Rate: `+7%`
- Pitch: `-1Hz`
- Summary style: conclusion first, then 2-4 key points, then a short next step

## What it includes

- `.codex-plugin/plugin.json` for Codex plugin metadata
- `skills/voice-reply/SKILL.md` for the Codex voice-reply workflow
- `scripts/say-neural.ps1` for neural TTS through `edge-tts`
- `scripts/say.ps1` as a Windows SAPI fallback
- `scripts/bootstrap.ps1` to create `.venv` and install `edge-tts`
- `samples/` with selected MP3 examples

## Install

Clone the repository:

```powershell
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
```

Install the local TTS dependency:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\bootstrap.ps1"
```

Test the neural voice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -Text "这是一次语音回复测试。"
```

List available Mandarin neural voices:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -ListVoices
```

Test the Windows fallback:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say.ps1" -Text "这是本机语音兜底测试。"
```

## Use in Codex conversations

Install or enable the plugin in Codex, then use the `voice-reply` skill when you want spoken replies.

For all Codex conversations on the same machine, add a rule like this to your global `AGENTS.md`:

````markdown
在准备正式文字回复前，先调用语音脚本播报一个中文口语化结果摘要，再发送文字版回复。语音摘要采用“总分总”：先讲结论，再按 2 到 4 点讲完成项、依据、不确定点或下一步，最后一句话收束。

优先使用神经网络语音脚本：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\path\to\codex-voice-reply-plugin\scripts\say-neural.ps1" -Voice "zh-CN-XiaoxiaoNeural" -Rate "+7%" -Pitch "-1Hz" -Text "这里放要播报的口语化摘要。"
```

如果神经网络语音失败，再使用 Windows 本机语音：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\path\to\codex-voice-reply-plugin\scripts\say.ps1" -Voice Huihui -Text "这里放要播报的口语化摘要。"
```
````

Replace `C:\path\to\codex-voice-reply-plugin` with the absolute path where you cloned this repository.

## Voice profiles

`say-neural.ps1` includes these profiles:

| Profile | Voice | Rate | Pitch | Use case |
| --- | --- | --- | --- | --- |
| `voice-reply` | `zh-CN-XiaoxiaoNeural` | `+7%` | `-1Hz` | Default Codex reply voice |
| `warm` | `zh-CN-XiaoxiaoNeural` | `+0%` | `+0Hz` | Warm female voice |
| `lively` | `zh-CN-XiaoyiNeural` | `+6%` | `+2Hz` | Lively female voice |
| `sunshine` | `zh-CN-YunxiNeural` | `+3%` | `+0Hz` | Relaxed male explainer |
| `professional` | `zh-CN-YunyangNeural` | `-2%` | `-1Hz` | Professional news voice |
| `podcast` | `zh-CN-XiaoxiaoNeural` | `-5%` | `-2Hz` | Slower podcast narration |

Override any profile value directly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -Voice "zh-CN-XiaoxiaoNeural" -Rate "+7%" -Pitch "-1Hz" -Text "这是一段自定义参数语音。"
```

## Notes

- `say-neural.ps1` requires network access because `edge-tts` calls Microsoft Edge online voices.
- `say.ps1` uses installed Windows SAPI voices and can work without the neural dependency.
- Generated audio is written to `out/`, which is ignored by git.

## License

MIT
