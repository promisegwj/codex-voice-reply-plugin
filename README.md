# Codex Voice Reply Plugin

让 Codex 在关键时刻用中文语音把结果讲出来，而不是只把文字甩到屏幕上。

Codex Voice Reply Plugin 是一套面向 Codex 的语音交互插件、本地 TTS 脚本和项目配置工具。它可以在最终回复、授权确认、任务阻塞、长任务阶段变化等关键时机，用可配置的中文声音播报口语化摘要；也可以按不同项目使用不同声音、不同语言和不同播报频率，让多个 Codex 会话并行时仍然清楚、安静、可辨认。

## 它解决什么痛点

很多人高频使用 Codex 时，会遇到这些小但很磨人的体验问题：

- 长任务跑着跑着不知道进展，只能反复盯屏幕。
- 多个 Codex 会话同时开着，分不清当前是哪一个项目在回复。
- 需要确认、授权、选择方案时，文字提示容易被忽略。
- 写代码、整理资料、做产品方案时，希望助手“有结果时说一声”，但不要一直打扰。
- 想给不同场景配置不同语气：代码项目稳一点，学习项目讲解多一点，产品讨论温和一点，声音实验室更适合试听比较。

这个项目的目标不是把所有文字都朗读出来，而是让 AI 协作更像一个真正好用的工作搭档：该安静时安静，该提醒时提醒，该总结时用一句话把重点讲清楚。

## 核心特色

- 中文结果播报：正式文字回复前先播报“总分总”口语摘要，先讲结论，再讲 2 到 4 个关键点，最后收束下一步。
- 项目级声音身份：不同项目可配置不同默认声音，听声音就能大致判断是哪一个工作区在回应。
- 多种交互模式：支持话痨模式、稳重秘书模式、收敛爱人模式、静默执行模式、教学讲解模式。
- 项目禁音机制：通过 `voice_disabled` 或 `suppressAllSpeech: true` 可以让指定项目完全静默。
- 并发播放保护：多个 Codex 会话同时说话时会用播放锁排队，避免音频互相叠在一起。
- 跨平台脚本：Windows 使用 PowerShell + edge-tts，macOS 使用 shell helper + edge-tts。
- 可视化配置网页：不用手写 JSON，也能为每个项目选择声音模式、默认声音、语言和自定义声音偏好。
- 多语言试听：配置页支持简体中文、英文、法文、日文、韩文界面和试听短句。
- 声音样本目录：内置角色音、讲解音、产品音、代码项目音等声音方向，方便生成、试听和迭代样本。

## 适合谁

- 高频使用 Codex 写代码、跑测试、修 bug 的开发者。
- 同时维护多个项目，希望用声音区分不同工作区的人。
- 做产品、写作、学习、研究时，希望 AI 在关键节点主动汇报的人。
- 喜欢语音陪伴式工作流，但又不想被全程朗读打断的人。
- 想搭建中文 TTS、角色声音样本、AI 口播实验环境的创作者。

## 快速安装

Windows PowerShell:

```powershell
git clone https://github.com/promisegwj/codex-voice-reply-plugin.git
cd codex-voice-reply-plugin
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\bootstrap.ps1"
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

## 让 Codex 帮你部署

你也可以把下面这段话直接发给 Codex，让它按你的系统自动引导安装：

```text
请帮我在本机部署并启用这个 Codex 语音交互项目：https://github.com/promisegwj/codex-voice-reply-plugin。请先判断我的系统是 Windows 还是 macOS，再引导我完成 git clone、Python 虚拟环境、edge-tts 依赖安装、语音脚本验证，以及如何把 AGENTS.md / voice-project-settings.json 接入到我的目标项目；安装完成后，请用项目 README 里的默认声音做一次简短测试。
```

## 接入到目标项目

1. 把本项目的语音规则复制或引用到目标项目的 `AGENTS.md`。
2. 在目标项目根目录放一个 `voice-project-settings.json` 或 `.codex-voice.json`。
3. 按项目类型选择策略和声音。

代码项目示例：

```json
{
  "projectTag": "coding_quiet",
  "strategy": "coding_focus",
  "modeOverride": "silent_executor",
  "voiceOverride": "project-coding-professional",
  "voiceIdentityLabel": "代码项目稳重男声",
  "suppressAllSpeech": false
}
```

完全静默项目示例：

```json
{
  "projectTag": "silent_project",
  "strategy": "voice_disabled",
  "modeOverride": "voice_disabled",
  "voiceOverride": null,
  "voiceIdentityLabel": "禁用语音",
  "suppressAllSpeech": true
}
```

语音脚本会读取当前目录向上的 `voice-project-settings.json` / `.codex-voice.json`。如果检测到 `suppressAllSpeech: true`、`strategy: "voice_disabled"` 或 `modeOverride: "voice_disabled"`，会直接静默退出。

## 可视化配置网页

如果不想手写 JSON，可以启动本地配置面板，在 Codex 的浏览器里为每个项目选择独立的项目语音模式和默认声音。项目语音模式会以卡片形式展示，点击卡片就会自动决定内部策略、播报频率和声音预览；提交后会把设置写入目标项目的 `voice-project-settings.json` 或 `.codex-voice.json`。

默认固定地址是 [http://127.0.0.1:47321/](http://127.0.0.1:47321/)。Windows 用户也可以直接双击仓库根目录的 `open-config-ui.cmd`。

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\start-config-ui.ps1" -Open
```

macOS:

```bash
bash "./scripts/start-config-ui.sh" --open
```

配置网页支持：

- 为每个项目选择完整的“项目语音模式”，由系统自动映射为策略、播报频率、声音和禁音配置。
- 为没有本地配置的项目自动分配不同声音，减少多项目并行时的混淆。
- 在简体中文、英文、法文、日文、韩文之间切换界面语言和试听短句。
- 按用户命名和提示词生成临时 `customVoice` 草稿，试听满意后再保存到项目。
- 开启“固定地址”后登记当前用户的本地启动项，让配置页地址保持稳定，不修改 Codex 应用本体。

自定义声音不会训练或克隆新音色，而是在可用 edge-tts 神经网络声音里自动选择 voice、语速、音高和试听文案。比如“温柔一点、少打扰、像阶段汇报”会生成偏稳的阶段汇报方案；“苍老、沙哑、沧桑、语速慢”等描述会尽量映射到慢速、低音高的女性声音近似方案。

## 内置项目策略

项目级策略配置在 `project-voice-strategies.json`，交互模式配置在 `voice-interaction-modes.json`。

| 策略 | 适用场景 | 默认声音 |
| --- | --- | --- |
| `reserved_partner_default` | 默认克制播报，只在必要节点出声 | 可爱角色音 |
| `voice_lab` | 声音样本生成、试听、比较，或更活泼的陪伴式项目 | 活泼小话痨角色音 |
| `coding_focus` | 修 bug、跑测试、批量执行 | 稳重男声 |
| `product_design` | 产品讨论、需求梳理、体验设计 | 温和女声 |
| `learning_mode` | 学习、调试讲解、复杂配置 | 松弛男声 |
| `voice_disabled` | 需要完全安静的项目 | 不发声 |

也可以直接使用面向用户的项目标签：`default_reserved`、`voice_lab_cute`、`coding_quiet`、`product_warm`、`learning_narrator`、`silent_project`。

## 典型使用场景

- 发布前检查：长时间跑测试时，完成后自动用中文说清结果。
- 多项目并行：代码项目、产品项目、学习项目使用不同声音，减少上下文混淆。
- 需要确认的操作：涉及授权、关键选择、阻塞问题时先语音提示，降低漏看的概率。
- 口播样本实验：围绕角色音、讲解音、旁白音生成样本并快速试听。
- 安静工作流：保留最终总结和必要提醒，不把每一步操作都念出来。

## 声音样本

默认提供这些声音身份和样本方向：

- `project-voice-lab-cute`：活泼小话痨角色音。
- `project-coding-professional`：代码项目稳重男声。
- `project-product-warm`：产品项目温和女声。
- `project-learning-narrator`：学习项目松弛男声。
- `02-anime-soft-loli-character`：全局默认可爱角色音。
- `A1-relaxed-female-explainer`、`A3-v2-gentle-companion-lighter`、`A3-v3`、`A5-casual-female-voiceover`：第一批 A 系列基准与调参样本。
- `01-anime-genki-heroine` 到 `07-anime-clean-young-male`：二次元角色、御姐、青音和青年男声样本。

声音目录见 `voice-sample-catalog.json`。高级规则和更多参数见 [Advanced Voice Configuration](docs/advanced-voice-configuration.md)。

## 文档入口

- [Advanced Voice Configuration](docs/advanced-voice-configuration.md)：完整语音规则、项目策略、禁音机制、并发播放、macOS 细节和声音样本目录。
- [Development Handbook](docs/development-handbook.md)：维护者工作手册、设计原则、发布流程和后续开发路线。
- [CONTRIBUTING.md](CONTRIBUTING.md)：本地开发、验证和 PR 约定。
- [SECURITY.md](SECURITY.md)：安全问题报告和隐私注意事项。
- [RELEASE_NOTES.md](RELEASE_NOTES.md)：当前版本亮点、验证结果和发布注意事项。

## 未来版本目标

- 一键安装和诊断：自动检查 Python、edge-tts、播放器、脚本权限、项目配置和禁音状态。
- JSON Schema 与配置校验：为 `voice-interaction-modes.json`、`project-voice-strategies.json`、项目配置文件提供结构验证。
- 配置页体验增强：增加导入导出、批量预览、配置 diff、回滚和更清楚的错误提示。
- 声音样本对比报告：生成多条样本后自动输出试听清单、参数表和适用建议。
- 更强的跨平台兜底：补充 Linux 播放方案，以及 macOS 系统 `say` 的离线 fallback。
- 更细的事件触发策略：区分测试通过、测试失败、等待用户、下载完成、长命令超时等状态。
- 多语言扩展：保留中文优先体验，同时继续完善英文、法文、日文、韩文等工作区语音策略。

## License

[MIT](LICENSE)
