# Development Handbook

本文是 Codex Voice Reply Plugin 在 `v0.3.0` 这一轮开发后的后续开发指引、工作手册和轻量白皮书。它面向维护者、后续 Codex agent 和希望扩展本项目的人，目标是把这一轮形成的产品判断、工程边界、发布流程和验证清单沉淀下来。

## 1. 项目定位

Codex Voice Reply Plugin 是一个给 Codex 对话增加中文语音交互能力的插件和本地脚本工具包。它不只是“最终回复前读一段总结”，而是逐步演进成一个项目级语音交互系统：

- 能在 Codex 回复前播报中文口语化摘要。
- 能根据不同项目选择不同朗读策略和默认声音。
- 能让某些项目完全禁用语音。
- 能通过播放锁避免多个对话同时发声冲突。
- 能在 Windows 和 macOS 上使用神经网络语音辅助脚本。
- 能保存、比较和扩展角色化声音样本。

本项目的重点不是做一个复杂 UI，而是把 Codex 的“什么时候该说话、用什么声音说、在哪些项目里不要说话”变成可配置、可复用、可发布的规则系统。

## 2. 本轮开发的核心变化

`v0.3.0` 这一轮完成了从“单一最终总结语音”到“项目感知语音交互策略 + 可视化项目配置”的升级。

主要结果：

- 默认声音改为 `02-anime-soft-loli-character`，使用 `zh-CN-XiaoyiNeural`、语速 `+5%`、音高 `+5Hz`。
- 默认交互模式仍是 `reserved_partner` / “收敛爱人”，强调克制、必要时出声。
- 新增 Plan 模式“一问一播一答一推进”规则，避免一次性读完多个后续问题。
- 新增 `voice_disabled` 策略，用于项目级完全禁音。
- 语音脚本会读取项目根目录向上的 `voice-project-settings.json` 或 `.codex-voice.json`。
- 神经网络语音脚本会在未显式指定 profile 时，自动根据项目策略选择默认声音。
- 新增 `project-voice-strategies.json`，让不同项目可以用不同声音身份。
- 新增 macOS shell helper：`scripts/say-neural-mac.sh`。
- 新增播放锁，避免多对话同时发声。
- 新增二次元、御姐、青音等角色声音样本目录。
- 新增 GitHub 社区文档：`CONTRIBUTING.md`、`SECURITY.md`、`docs/advanced-voice-configuration.md`。
- 新增本地配置网页：`web/config-ui/` 和 `scripts/start-config-ui.py`，用于在 Codex 浏览器里配置项目策略、播报模式和默认声音。
- 新增配置网页多语言入口：当前支持中文、英文、法文、日文和韩文，前端只翻译显示文案，不改变配置 key。
- 配置网页试听改为按当前语言临时生成声音性格 slogan；长度按声音性格自适应，话痨/教学类可稍长，稳重/静默类保持短句。
- 新增命名 + 偏好提示词生成 `customVoice`：前端先生成临时草稿和试听文件；只有点击“保存到项目”才把用户命名和 voice/rate/pitch/style/slogan 写入配置并插入“默认声音”下拉；普通提交配置或页面退出会清理未保存草稿，Windows/macOS 播报脚本只读取已保存方案。
- 新增项目语音模式层：`projectTag` 作为兼容字段保存，但 UI 上表现为完整模式选择，系统再把模式解释为 strategy、mode、voice 和禁音配置。
- 新增自动分配规则：没有本地配置的项目会按关键词或路径哈希自动获得不同项目标签和默认声音，配置网页可一键写入缺失配置。
- 新增配置网页“固定地址”开关：开启后，本机会在 Codex 启动时固定配置网页地址；底层通过当前用户本地服务启动项保持固定端口可用。

## 3. 设计原则

### 3.1 先尊重项目，再考虑全局默认

语音行为的优先级是：

1. 用户在当前对话中的明确指令。
2. 当前项目根目录的 `voice-project-settings.json` 或 `.codex-voice.json`。
3. 仓库内 `project-voice-strategies.json` 的策略定义。
4. `AGENTS.md` 和全局默认规则。

这条优先级的意义是：同一台机器上可能同时存在多个 Codex 项目。每个项目的语音策略应该由项目自己决定，而不是全部套用同一种声音或播报频率。

### 3.2 需要用户回应时才应主动出声

声音不是越多越好。对话体验的关键是播报时机。

强制播报场景包括：

- 请求授权、允许、确认。
- Plan 模式要求用户选择当前选项。
- 遇到无法自行判断的关键取舍。
- 任务被阻塞，需要用户帮助。
- 准备发送正式文字回复前。

但如果项目启用了 `voice_disabled`，这些强制播报也必须被压住。

### 3.3 Plan 模式必须轮次化

Plan 模式的语音交互规则是：

- 每次只提出一个问题。
- 只播报当前问题和当前选项。
- 等用户选择后，先确认理解。
- 再进入下一个问题。

不要把未来的多个问题一次性播报出来。这会让用户听到一长串内容，但真正可操作的选择还没有出现，交互感会变差。

### 3.4 项目声音身份要可辨认

不同项目可以使用不同默认声音，让用户通过声音判断当前回复来自哪个项目。

当前推荐身份：

- `project-voice-lab-cute`：活泼小话痨角色音。
- `project-coding-professional`：代码项目稳重男声。
- `project-product-warm`：产品项目温和女声。
- `project-learning-narrator`：学习项目松弛男声。
- `02-anime-soft-loli-character`：全局默认可爱角色音。

声音身份不应该替代项目名称或上下文说明，但可以作为多对话并行时的听觉提示。

### 3.5 公开仓库不要发布私有项目策略

共享配置里不要硬编码维护者本机项目名、绝对路径或私人工作流。私有项目策略应放在该项目本地的：

- `voice-project-settings.json`
- `.codex-voice.json`

公开仓库只保留通用策略、示例和模板。

## 4. 仓库结构

核心文件和目录：

- `.codex-plugin/plugin.json`：Codex 插件元数据。
- `skills/voice-reply/SKILL.md`：Codex skill 入口和语音工作流规则。
- `scripts/say-neural.ps1`：Windows / PowerShell 神经网络语音 helper。
- `scripts/say.ps1`：Windows SAPI 本机语音 fallback。
- `scripts/say-neural-mac.sh`：macOS shell 神经网络语音 helper。
- `scripts/start-config-ui.py`：跨平台本地配置网页服务，负责扫描项目和写入项目语音设置。
- `scripts/start-config-ui.ps1`：Windows 启动配置网页的包装脚本。
- `scripts/start-config-ui.sh`：macOS / Linux 启动配置网页的包装脚本。
- `web/config-ui/`：Codex 可打开的项目语音配置网页。
- `voice-interaction-modes.json`：交互模式、默认声音、播放并发、平台支持等配置。
- `project-voice-strategies.json`：项目级朗读策略和默认声音身份。
- `voice-project-settings.example.json`：目标项目本地配置模板。
- `voice-sample-catalog.json`：角色声音样本目录和推荐参数。
- `AGENTS.md`：面向 Codex 的项目级行为规则。
- `README.md`：GitHub 首页、安装入口、快速上手。
- `docs/advanced-voice-configuration.md`：高级语音配置参考。
- `CONTRIBUTING.md`：开发、验证和 PR 约定。
- `SECURITY.md`：安全和隐私说明。
- `samples/`：可发布的声音样本。
- `out/`：本地生成音频输出，必须保持 ignored。
- `.venv/`：本地 Python 虚拟环境，必须保持 ignored。

## 5. 配置模型

### 5.1 交互模式

交互模式控制“什么时候说”和“说多少”，不默认改变声音本身。

当前模式：

- `chatty_companion` / 话痨模式：过程感强，适合希望强互动的场景。
- `steady_secretary` / 稳重秘书模式：关键节点播报，适合工作协作。
- `reserved_partner` / 收敛爱人模式：默认模式，克制但不断联。
- `silent_executor` / 静默执行模式：尽量少说，只保留必要播报。
- `teaching_narrator` / 教学讲解模式：解释取舍和原因，适合学习和复杂配置。
- `voice_disabled` / 禁用语音模式：完全不发声。

### 5.2 声音 profile

声音 profile 控制“用什么声音说”。

脚本支持两类 profile：

- 基础声音：`soft_loli_character`、`warm`、`lively`、`professional` 等。
- 项目身份声音：`project-coding-professional`、`project-product-warm` 等。

在没有显式传入 `-Profile` 或 `--profile` 时，脚本会尝试从项目配置解析默认声音。

### 5.3 项目配置

目标项目可以放置：

```json
{
  "strategy": "coding_focus",
  "modeOverride": null,
  "voiceOverride": "project-coding-professional",
  "voiceIdentityLabel": "代码项目稳重男声"
}
```

完全禁音项目可以放置：

```json
{
  "strategy": "voice_disabled",
  "modeOverride": "voice_disabled",
  "voiceOverride": null,
  "suppressAllSpeech": true
}
```

脚本会从当前工作目录向上查找配置文件。因此，开发和测试时要注意当前 shell 的 `workdir`。

## 6. 脚本行为边界

### 6.1 生成和播放

`scripts/say-neural.ps1` 和 `scripts/say-neural-mac.sh` 都会：

- 读取文本。
- 解析 voice/profile/rate/pitch。
- 调用 `edge-tts` 生成音频。
- 默认播放音频。
- 使用 `-NoPlay` / `--no-play` 时只生成不播放。

默认输出目录是仓库根目录下的 `out/`，而不是 `scripts/out/`。脚本会判断自己是否位于 `scripts/` 下，并自动把上一级作为仓库根目录。

### 6.2 禁音防线

禁音有两层：

- 规则层：Codex agent 不应该调用语音脚本。
- 脚本层：即使旧对话误调用脚本，脚本也会读取项目配置并静默退出。

这层脚本防线是必须保留的。它解决了旧对话可能已经加载旧规则、不会自动重读新 `AGENTS.md` 的问题。

### 6.3 播放锁

播放锁用于避免多个 Codex 对话同时发声。

行为：

- 一个对话正在播放时，另一个对话会等待。
- 等待超时后跳过播放，但保留生成的音频文件。
- 输出文件名带时间戳和进程号，避免覆盖。

## 7. 声音样本策略

声音样本用于试听、比较和迭代，而不是自动生成所有可能组合。

新增声音方向时，应先更新 `voice-sample-catalog.json`：

- `id`
- `displayName`
- `recommendedVoice`
- `profile`
- `rate`
- `pitch`
- `style`
- `useCases`
- `sampleCopyDirection`

生成 MP3 之前，优先让用户确认要生成哪些样本。对于“萝莉/幼态角色音”这类描述，只能作为可爱、童话、游戏角色感的非成人化声音方向处理。

## 8. 开发流程

推荐流程：

1. 从 `main` 创建短分支。
2. 做小范围改动。
3. 跑对应验证。
4. 检查隐私和发布内容。
5. 开 draft PR。
6. 合并前确认 README 和 skill 入口一致。
7. 合并后按版本创建 release。

常用命令：

```powershell
git status -sb --ignored
git checkout main
git pull --ff-only
git checkout -b codex/<short-description>
```

提交前至少检查：

```powershell
Get-Content -Raw -Encoding UTF8 .\voice-interaction-modes.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 .\project-voice-strategies.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 .\.codex-plugin\plugin.json | ConvertFrom-Json | Out-Null
$null = [scriptblock]::Create((Get-Content -Raw -Encoding UTF8 .\scripts\say-neural.ps1))
$null = [scriptblock]::Create((Get-Content -Raw -Encoding UTF8 .\scripts\say.ps1))
```

语音生成验证：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\say-neural.ps1" -Profile soft_loli_character -Text "验证语音生成。" -NoPlay
```

禁音验证：

1. 在临时目录放一个 `voice-project-settings.json`。
2. 设置 `suppressAllSpeech: true`。
3. 用 `-ProjectRoot` 指向该目录。
4. 确认脚本无输出、不新增音频。

## 9. 发布流程

当前发布方式：

- PR 合并到 `main`。
- 插件版本写在 `.codex-plugin/plugin.json`。
- 创建 GitHub Release，例如 `v0.2.0`。

发布前检查：

- README 中没有占位链接。
- 公开配置中没有机器特定项目名。
- 文档中没有本机绝对路径。
- `.venv/`、`out/`、`.env*`、日志和临时文件没有进入提交。
- JSON 全部可解析。
- PowerShell 脚本语法可解析。
- Windows 神经网络生成可验证。
- macOS 脚本如有行为改动，尽量在真机验证。

发布后检查：

```powershell
git status -sb --ignored
gh pr view <number> --json state,mergedAt,mergeCommit
gh release view <tag> --json url,tagName,isDraft,isPrerelease,publishedAt
```

## 10. 隐私和安全要求

不要提交：

- 本地虚拟环境。
- 本地输出音频。
- 本机绝对路径。
- 私有项目名和私人工作流。
- 账号凭据、访问令牌、密钥材料。
- `.env*` 文件。
- 调试日志。

公开仓库应只包含通用配置、示例模板和可发布样本。私有策略放在目标项目自己的本地配置里。

## 11. 文档维护规则

文档分工：

- `README.md`：只负责首次理解、安装、快速接入、常见配置。
- `docs/advanced-voice-configuration.md`：负责完整语音规则和高级配置。
- `docs/development-handbook.md`：负责维护者视角的设计原则、流程和后续开发手册。
- `CONTRIBUTING.md`：负责贡献流程和验证命令。
- `SECURITY.md`：负责安全报告和隐私注意事项。

新增功能时，优先判断它属于哪个层级，不要把所有细节都塞进 README。

## 12. 后续路线

建议后续按优先级推进。优先级的判断标准是：先降低安装失败和配置误解，再提升声音质量和传播效果。

### 12.1 v0.3.x 稳定性和安装体验

1. 真机验证 macOS 播放链路，并记录结果。
   验收标准：在 macOS 上完成 `say-neural-mac.sh` 的生成、播放、禁音、锁等待和 `--no-play` 检查。

2. 增加一键健康诊断命令。
   验收标准：能检查 Python、edge-tts、播放器、脚本权限、项目配置、禁音状态、输出目录可写性和网络可用性，并给出明确修复建议。

3. 增加 `resolve-voice-strategy` 小工具。
   验收标准：传入项目路径后输出最终是否发声、命中的配置文件、项目标签、策略、交互模式、voice、rate、pitch、locale 和禁音原因。

4. 增加 JSON Schema。
   验收标准：覆盖 `voice-interaction-modes.json`、`project-voice-strategies.json`、`voice-project-settings.json` / `.codex-voice.json`，并接入发布前验证。

### 12.2 v0.4 配置页和工作流增强

1. 配置页增加导入导出、批量预览、配置 diff 和回滚。
   验收标准：用户能看到保存前后差异，能恢复上一次配置，批量操作不会覆盖用户明确保留的项目。

2. 配置页增加项目搜索、常用项目固定和状态筛选。
   验收标准：当工作区项目很多时，用户能快速找到“未配置、已禁音、使用自定义声音、配置异常”的项目。

3. 细化事件触发策略。
   验收标准：能区分测试通过、测试失败、等待用户、下载完成、长命令超时、需要授权、发生异常等事件，并为不同事件选择不同摘要模板。

4. 完善多语言策略。
   验收标准：不同项目可稳定绑定不同 `voiceLocale`，配置页、试听和最终播报都能保持一致；缺少目标语言 voice 时有明确 fallback。

### 12.3 v0.5 声音质量和样本体系

1. 声音样本对比报告。
   验收标准：生成一组样本后自动输出试听清单、参数表、适用场景、用户评分位和推荐结论。

2. 更短的 release assets 试听样本。
   验收标准：每个代表声音保留 5 到 12 秒以内的示例，便于 GitHub Release、README 或配置页快速试听。

3. 自定义声音偏好迭代。
   验收标准：提示词映射结果能解释“为什么选这个 voice、rate、pitch”，并支持用户基于上一次结果继续微调。

4. 声音安全边界继续固化。
   验收标准：角色音、幼态音、陪伴音等描述始终落在非成人化、非暧昧化、非性化的使用边界内。

### 12.4 v1.0 发布和生态化

1. 自动化发布检查。
   验收标准：一个命令统一跑 JSON、PowerShell、Python、隐私扫描、README 链接检查、基础语音生成和配置 UI 启动检查。

2. Release asset 生成。
   验收标准：自动打包插件必要文件、生成校验摘要、附带精简样本和发布说明。

3. 插件市场化打包。
   验收标准：整理 Codex plugin 的 manifest、默认提示词、技能入口、截图或短演示素材，让新用户能在最短路径内理解并启用。

4. 长期兼容策略。
   验收标准：为配置文件版本号、旧字段迁移、弃用字段和脚本参数兼容制定清晰规则，避免后续版本破坏已有用户配置。

## 13. 给后续 Codex agent 的工作准则

后续维护这个项目时，请遵守：

- 默认在仓库根目录工作。
- 开始前先读 `README.md`、本手册和高级配置文档。
- 不要把私有项目规则写进共享配置。
- 不要默认生成大量音频文件。
- 修改脚本时同时考虑 Windows、macOS、禁音和并发播放。
- 修改交互规则时同步更新 `AGENTS.md` 和 `skills/voice-reply/SKILL.md`。
- 修改项目策略时同步检查 `project-voice-strategies.json`、`voice-interaction-modes.json` 和 README 链接。
- 任何发布前都要跑隐私检查和基础验证。

本项目的核心体验目标是：让 Codex 的声音“该出现时出现，不该出现时安静”，并且在多项目、多对话、多平台环境里保持可预期。
