# Codex Voice Interaction Kit

这是一个给 Codex 对话增加中文语音播报、项目级朗读策略、角色声音样本和跨平台 TTS 脚本的小工具包。

## 先看哪份文档

- `README.md`：首次安装、复制给 Codex 的部署提示词、快速接入和最常见配置。
- [Advanced Voice Configuration](docs/advanced-voice-configuration.md)：高级语音规则参考，包含交互模式、项目策略、禁音机制、并发播放、macOS 细节和声音样本目录。

第一次使用只需要看本文件；需要深度定制时再看高级配置文档。

## 给 Codex 复制这一句话

直接复制下面这句话发给对方的 Codex：

```text
请帮我在本机部署并启用这个 Codex 语音交互项目：https://github.com/promisegwj/codex-voice-reply-plugin。请先判断我的系统是 Windows 还是 macOS，再引导我完成 git clone、Python 虚拟环境、edge-tts 依赖安装、语音脚本验证，以及如何把 AGENTS.md / voice-project-settings.json 接入到我的目标项目；安装完成后，请用项目 README 里的默认声音做一次简短测试。
```

如果只给 Codex 一个 GitHub 地址，也可以这样说：

```text
请打开这个 GitHub 项目并按 README 指导我完成本地部署：https://github.com/promisegwj/codex-voice-reply-plugin。目标是让 Codex 在支持的项目里自动用中文语音播报，并能按不同项目采用不同朗读策略和默认声音。
```

## 快速安装

Windows PowerShell:

```powershell
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -U pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -Profile soft_loli_character -Text "语音安装测试完成。"
```

macOS:

```bash
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
python3 -m venv .venv
./.venv/bin/python -m pip install -U pip
./.venv/bin/python -m pip install -r requirements.txt
bash "./scripts/say-neural-mac.sh" --profile soft_loli_character --text "语音安装测试完成。"
```

## 接入到目标项目

1. 把本项目的语音规则复制或引用到目标项目的 `AGENTS.md`。
2. 在目标项目根目录放一个 `voice-project-settings.json` 或 `.codex-voice.json`。
3. 选择项目策略和声音，例如：

```json
{
  "strategy": "coding_focus",
  "modeOverride": null,
  "voiceOverride": "project-coding-professional",
  "voiceIdentityLabel": "代码项目稳重男声"
}
```

如果某个项目完全不要发声：

```json
{
  "strategy": "voice_disabled",
  "modeOverride": "voice_disabled",
  "voiceOverride": null,
  "suppressAllSpeech": true
}
```

语音脚本会读取当前目录向上的 `voice-project-settings.json` / `.codex-voice.json`；如果检测到 `suppressAllSpeech: true` 或 `voice_disabled`，会直接静默退出。

## 不同项目用不同声音

项目级声音配置在 `project-voice-strategies.json` 和 `voice-interaction-modes.json` 里。默认提供这些声音身份：

- `project-voice-lab-cute`：声音实验室角色音。
- `project-coding-professional`：代码项目稳重男声。
- `project-product-warm`：产品项目温和女声。
- `project-learning-narrator`：学习项目松弛男声。
- `02-anime-soft-loli-character`：全局默认可爱角色音。

这样多项目并行时，用户可以通过声音大致判断当前回复来自哪个项目。

更多规则、模式和样本说明见 [Advanced Voice Configuration](docs/advanced-voice-configuration.md)。

## 社区文档

- [CONTRIBUTING.md](CONTRIBUTING.md)：本地开发、验证和发布前检查。
- [SECURITY.md](SECURITY.md)：安全问题报告和隐私注意事项。
