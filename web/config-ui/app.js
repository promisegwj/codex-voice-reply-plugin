const state = {
  bootstrap: null,
  projects: [],
  selectedProject: null,
  locale: localStorage.getItem("codexVoiceConfigLocale") || "zh-CN",
  customVoice: null,
  customVoiceDraft: null,
  customVoiceDraftAudioUrl: "",
};

const CUSTOM_VOICE_OPTION_VALUE = "__custom_voice__";

const TRANSLATIONS = {
  "zh-CN": {
    languageName: "简体中文",
    ui: {
      documentTitle: "Codex 语音配置",
      appTitle: "项目语音配置",
      language: "语言",
      refreshProjects: "刷新项目列表",
      autoAssignTitle: "自动写入配置",
      autoAssignHelp: "系统会先按项目名和路径关键词选择模式；没有命中时，再按项目路径稳定分配一个模式，让不同项目默认有不同声音。",
      autoMissing: "给尚未配置的项目根据项目特性自动配置",
      autoOverwrite: "给所有项目按照项目特性自动配置",
      autoAssignButton: "按规则写入项目配置",
      fixedAddressTitle: "固定地址",
      fixedAddressHelp: "开启后，本机会在 Codex 启动时固定配置网页地址。",
      fixedAddressToggle: "在 Codex 启动时固定配置网页地址",
      fixedAddressLoading: "正在读取固定地址状态...",
      search: "搜索",
      searchPlaceholder: "项目名或路径",
      selectProject: "选择一个项目",
      selectProjectHelp: "启动本地配置服务后，会在这里显示可配置的 Codex 项目。",
      notSelected: "未选择",
      projectVoiceMode: "项目语音模式",
      defaultVoice: "默认声音",
      preview: "试听",
      customVoiceTitle: "按偏好生成播报声音",
      customVoiceHelp: "先给声音起个名字，再写下你希望这个项目听起来像什么；系统会生成一个可试听、可保存的声音源。",
      customVoiceName: "声音名字",
      customVoiceNamePlaceholder: "例如：阶段汇报小稳",
      customVoicePlaceholder: "例如：温柔一点，少打扰，像产品经理做阶段汇报。",
      generateCustomVoice: "生成并试听",
      saveCustomVoice: "保存到项目",
      clearCustomVoice: "清除自定义",
      customVoiceEmpty: "尚未生成自定义声音方案。",
      customVoiceNameRequired: "请先给这个声音起个名字。",
      customVoicePromptRequired: "请先写一点声音偏好。",
      customVoiceGenerating: "正在生成自定义声音方案...",
      customVoiceGenerated: "已生成自定义声音方案，并准备试听。",
      customVoiceCleared: "已清除自定义声音方案。",
      customVoiceSummary: "自定义声音：{label} · {voice} · Rate {rate} · Pitch {pitch}",
      notes: "备注",
      notesPlaceholder: "写给维护者或后续 Codex 的简短说明",
      disableVoiceForProject: "本项目完全禁用语音",
      applyConfig: "提交配置",
      copyJson: "复制 JSON",
      currentVoice: "当前声音",
      pendingWrite: "即将写入",
      enabled: "语音开启",
      disabled: "语音禁用",
      noTag: "未设标签",
      auto: "自动",
      byStrategy: "随策略",
      mode: "模式",
      speech: "播报",
      voice: "声音",
      style: "风格",
      notSpecified: "未指定",
      resolvedByStrategy: "随策略解析",
      none: "无",
      followVoiceMode: "随语音模式",
      followModeVoice: "随模式默认声音",
      noProjects: "没有匹配的项目。",
      fixedNotRead: "还没有读取到固定地址状态。",
      fixedUnsupported: "{platform} 暂不支持在网页里固定地址；仍可手动运行启动命令。",
      fixedOn: "已开启",
      fixedOff: "未开启",
      readingConfig: "正在读取本地配置...",
      configServiceStatus: "配置服务返回 {status}",
      readProjects: "已读取 {count} 个项目。",
      noScannedProjects: "没有扫描到项目，可以用 --workspace-root 指向你的 Codex 工作区。",
      chooseProjectFirst: "请先选择一个项目。",
      writingConfig: "正在写入项目配置...",
      writeFailed: "写入失败：{status}",
      wrotePath: "已写入 {path}",
      noWritableProjects: "当前没有可写入的项目。",
      autoWritingOverwrite: "正在覆盖写入列表中所有项目配置...",
      autoWritingMissing: "正在给缺失配置的项目自动写入...",
      autoWriteFailed: "自动写入失败：{status}",
      autoWroteAll: "已写入 {written} 个项目。",
      autoWroteMissing: "已写入 {written} 个项目，跳过 {skipped} 个已有配置项目。",
      fixedOpening: "正在开启配置网页固定地址...",
      fixedClosing: "正在关闭配置网页固定地址...",
      fixedFailed: "固定地址设置失败：{status}",
      fixedOpened: "已开启配置网页固定地址。",
      fixedClosed: "已关闭配置网页固定地址。",
      noPreviewVoice: "当前没有可试听的声音。",
      generating: "生成中",
      preparingPreview: "正在准备声音试听...",
      previewFailed: "试听失败：{status}",
      playingSample: "正在播放短句试听。",
      playingGenerated: "正在播放短句试听。",
      previewReady: "试听已准备好，请点击音频控件播放。",
      jsonCopied: "JSON 已复制。",
      copyFailed: "浏览器没有开放剪贴板权限，请手动选中 JSON 复制。",
      connectFailed: "无法连接本地配置服务：{message}。请通过 scripts/start-config-ui 启动，而不是直接打开 HTML 文件。",
    },
    projectTags: {
      default_reserved: { name: "轻声陪伴", description: "低频播报，只在关键节点、阻塞和最终回复时出声。", identity: "默认可爱角色音" },
      voice_lab_cute: { name: "活泼小话痨", description: "更爱说一点，语气活泼，进展、发现和有意思的小转折都会主动讲。", identity: "活泼小话痨角色音" },
      coding_quiet: { name: "安静执行", description: "修代码、跑测试时尽量少说，只在阻塞和完成时汇报。", identity: "代码项目稳重男声" },
      product_warm: { name: "阶段汇报", description: "像稳重秘书一样在关键阶段同步进展和取舍。", identity: "产品项目温和女声" },
      learning_narrator: { name: "教学讲解", description: "会解释概念、步骤和原因，适合学习或复杂配置。", identity: "学习项目松弛男声" },
      silent_project: { name: "完全静音", description: "不调用语音脚本，包括确认、Plan 选择和最终回复。", identity: "禁用语音" },
    },
    modes: {
      chatty_companion: "话痨模式",
      steady_secretary: "稳重秘书模式",
      reserved_partner: "收敛爱人模式",
      silent_executor: "静默执行模式",
      teaching_narrator: "教学讲解模式",
      voice_disabled: "禁用语音模式",
    },
    voiceStyles: {
      "02-anime-soft-loli-character": "轻、软、可爱、童话感，避免成人化表达",
      "A3-v3": "旧主声音基准，温柔陪伴型女声",
      "A1-relaxed-female-explainer": "慢一点、松弛一点的女声讲解",
      "A3-v2-gentle-companion-lighter": "A3 调参版本，更轻一点的温柔陪伴女声",
      "A5-casual-female-voiceover": "自然口播感女声，轻松但不夸张",
      "01-anime-genki-heroine": "元气二次元少女，明亮、弹跳感、节奏偏快",
      "03-anime-sweet-idol": "甜系偶像少女，甜、亮、亲近、轻微舞台感",
      "04-anime-cool-senior-sister": "清冷御姐，冷静、低一点、边界感强",
      "05-anime-warm-senior-sister": "温柔御姐，成熟、松弛、照顾感强",
      "06-anime-youth-qingyin": "青音少年，清爽、少年感、轻快",
      "07-anime-clean-young-male": "清爽青年男声，年轻、干净、适合讲解",
      "project-coding-professional": "稳重男声，适合代码、测试和工程执行",
      "project-product-warm": "温和女声，适合产品设计和需求讨论",
      "project-learning-narrator": "松弛青年男声，适合教学讲解和长解释",
      "project-voice-lab-cute": "活泼小话痨角色音，适合更活泼、更有存在感的项目",
    },
    previewSlogans: {
      "02-anime-soft-loli-character": "轻轻提醒你，下一步也可以很可爱。",
      "A3-v3": "我会温柔一点，把结果讲清楚。",
      "A1-relaxed-female-explainer": "慢一点说，复杂的事也会变清楚。",
      "A3-v2-gentle-companion-lighter": "我在旁边，轻轻跟你同步进展。",
      "A5-casual-female-voiceover": "用自然一点的节奏，快速讲重点。",
      "01-anime-genki-heroine": "准备好啦，我们把任务往前推！看到新进展的时候，我会马上喊你一声。",
      "03-anime-sweet-idol": "今天也把项目做得漂亮一点吧。亮点出现的时候，我会甜甜地告诉你。",
      "04-anime-cool-senior-sister": "保持冷静，关键点我会直接说。",
      "05-anime-warm-senior-sister": "别急，我会把下一步讲清楚。",
      "06-anime-youth-qingyin": "清爽一点，快速确认当前状态。",
      "07-anime-clean-young-male": "干净利落，把结果说清楚。",
      "project-coding-professional": "代码完成后，我只报告关键结果。",
      "project-product-warm": "我会温和地同步进展和取舍。",
      "project-learning-narrator": "放慢一点，把原因和步骤讲明白；理解之后，再继续往下走。",
      "project-voice-lab-cute": "有意思的小转折，我会第一个告诉你。要是进展有点可爱，我也会多说两句。",
    },
  },
  en: {
    languageName: "English",
    ui: {
      documentTitle: "Codex Voice Config",
      appTitle: "Project Voice Config",
      language: "Language",
      refreshProjects: "Refresh projects",
      autoAssignTitle: "Auto Configure",
      autoAssignHelp: "The page first uses project name and path keywords; if none match, it assigns a stable mode from the project path so different projects can use different voices.",
      autoMissing: "Auto-configure unconfigured projects by project traits",
      autoOverwrite: "Auto-configure all projects by project traits",
      autoAssignButton: "Write project configs",
      fixedAddressTitle: "Fixed Address",
      fixedAddressHelp: "When enabled, this machine keeps the config page address fixed when Codex starts.",
      fixedAddressToggle: "Keep the config page address fixed when Codex starts",
      fixedAddressLoading: "Reading fixed-address status...",
      search: "Search",
      searchPlaceholder: "Project name or path",
      selectProject: "Select a project",
      selectProjectHelp: "After the local config service starts, configurable Codex projects appear here.",
      notSelected: "Not selected",
      projectVoiceMode: "Project Voice Mode",
      defaultVoice: "Default Voice",
      preview: "Preview",
      customVoiceTitle: "Generate Voice From Preference",
      customVoiceHelp: "Name the voice, then describe how this project should sound; the page will create a previewable voice source you can save.",
      customVoiceName: "Voice name",
      customVoiceNamePlaceholder: "Example: Milestone Briefing",
      customVoicePlaceholder: "Example: warm, low interruption, like a product manager giving milestone updates.",
      generateCustomVoice: "Generate and Preview",
      saveCustomVoice: "Save to Project",
      clearCustomVoice: "Clear Custom",
      customVoiceEmpty: "No custom voice plan generated yet.",
      customVoiceNameRequired: "Name this voice first.",
      customVoicePromptRequired: "Write a short voice preference first.",
      customVoiceGenerating: "Generating custom voice plan...",
      customVoiceGenerated: "Custom voice plan generated and ready to preview.",
      customVoiceCleared: "Custom voice plan cleared.",
      customVoiceSummary: "Custom voice: {label} · {voice} · Rate {rate} · Pitch {pitch}",
      notes: "Notes",
      notesPlaceholder: "Short note for maintainers or a future Codex session",
      disableVoiceForProject: "Disable voice completely for this project",
      applyConfig: "Apply Config",
      copyJson: "Copy JSON",
      currentVoice: "Current Voice",
      pendingWrite: "Will Write",
      enabled: "Voice on",
      disabled: "Voice off",
      noTag: "No tag",
      auto: "Auto",
      byStrategy: "By strategy",
      mode: "Mode",
      speech: "Speech",
      voice: "Voice",
      style: "Style",
      notSpecified: "Not specified",
      resolvedByStrategy: "Resolved by strategy",
      none: "None",
      followVoiceMode: "Follow voice mode",
      followModeVoice: "Follow mode default voice",
      noProjects: "No matching projects.",
      fixedNotRead: "Fixed-address status has not been loaded yet.",
      fixedUnsupported: "{platform} cannot set the fixed address from this page yet; run the start command manually.",
      fixedOn: "Enabled",
      fixedOff: "Disabled",
      readingConfig: "Reading local config...",
      configServiceStatus: "Config service returned {status}",
      readProjects: "Loaded {count} projects.",
      noScannedProjects: "No projects found. Use --workspace-root to point at your Codex workspace.",
      chooseProjectFirst: "Select a project first.",
      writingConfig: "Writing project config...",
      writeFailed: "Write failed: {status}",
      wrotePath: "Wrote {path}",
      noWritableProjects: "There are no writable projects right now.",
      autoWritingOverwrite: "Writing automatic config for all listed projects...",
      autoWritingMissing: "Writing automatic config for unconfigured projects...",
      autoWriteFailed: "Auto configure failed: {status}",
      autoWroteAll: "Wrote {written} projects.",
      autoWroteMissing: "Wrote {written} projects, skipped {skipped} projects with existing config.",
      fixedOpening: "Enabling fixed config page address...",
      fixedClosing: "Disabling fixed config page address...",
      fixedFailed: "Fixed-address setting failed: {status}",
      fixedOpened: "Fixed config page address enabled.",
      fixedClosed: "Fixed config page address disabled.",
      noPreviewVoice: "There is no voice to preview.",
      generating: "Generating",
      preparingPreview: "Preparing voice preview...",
      previewFailed: "Preview failed: {status}",
      playingSample: "Playing a short voice slogan.",
      playingGenerated: "Playing a short voice slogan.",
      previewReady: "Preview is ready. Use the audio control to play it.",
      jsonCopied: "JSON copied.",
      copyFailed: "Clipboard access is unavailable. Select and copy the JSON manually.",
      connectFailed: "Could not connect to the local config service: {message}. Start it with scripts/start-config-ui instead of opening the HTML file directly.",
    },
    projectTags: {
      default_reserved: { name: "Light Companion", description: "Low-frequency updates only at key moments, blockers, and final replies.", identity: "Default cute character voice" },
      voice_lab_cute: { name: "Lively Chatter", description: "More talkative and playful; proactively explains progress, discoveries, and small turns.", identity: "Lively chatty character voice" },
      coding_quiet: { name: "Quiet Execution", description: "Keeps quiet while coding and testing; reports only blockers and completion.", identity: "Steady coding-project male voice" },
      product_warm: { name: "Milestone Briefing", description: "Reports progress and tradeoffs at important milestones, like a calm secretary.", identity: "Warm product-project female voice" },
      learning_narrator: { name: "Teaching Narration", description: "Explains concepts, steps, and reasons for learning or complex setup.", identity: "Relaxed learning-project male voice" },
      silent_project: { name: "Fully Silent", description: "Does not call voice scripts, including confirmations, Plan choices, and final replies.", identity: "Voice disabled" },
    },
    modes: {
      chatty_companion: "Chatty Mode",
      steady_secretary: "Steady Secretary",
      reserved_partner: "Reserved Partner",
      silent_executor: "Silent Executor",
      teaching_narrator: "Teaching Narrator",
      voice_disabled: "Voice Disabled",
    },
    voiceStyles: {
      "02-anime-soft-loli-character": "Soft, cute, fairy-tale character feel; non-adult framing",
      "A3-v3": "Former main voice baseline, warm companion female voice",
      "A1-relaxed-female-explainer": "Slower relaxed female explainer",
      "A3-v2-gentle-companion-lighter": "Lighter tuned A3 companion female voice",
      "A5-casual-female-voiceover": "Natural casual female voiceover",
      "01-anime-genki-heroine": "Energetic anime heroine, bright and quick",
      "03-anime-sweet-idol": "Sweet idol-style girl voice, bright and friendly",
      "04-anime-cool-senior-sister": "Cool senior-sister style, calm and lower",
      "05-anime-warm-senior-sister": "Warm senior-sister style, mature and relaxed",
      "06-anime-youth-qingyin": "Clear youthful male voice, light and fresh",
      "07-anime-clean-young-male": "Clean young male voice for explanation",
      "project-coding-professional": "Steady male voice for code, tests, and engineering work",
      "project-product-warm": "Warm female voice for product and design discussion",
      "project-learning-narrator": "Relaxed young male voice for teaching and long explanations",
      "project-voice-lab-cute": "Lively chatty character voice for more present projects",
    },
    previewSlogans: {
      "02-anime-soft-loli-character": "A soft nudge can make the next step feel lighter.",
      "A3-v3": "I will keep it warm, clear, and brief.",
      "A1-relaxed-female-explainer": "Slow it down, and the hard parts become clear.",
      "A3-v2-gentle-companion-lighter": "Quietly beside you, keeping progress in view.",
      "A5-casual-female-voiceover": "Natural pace, quick context, clean focus.",
      "01-anime-genki-heroine": "Ready when you are; let us move it forward. When progress pops, I will jump in quickly.",
      "03-anime-sweet-idol": "Let us make this project shine a little brighter. I will call out the good moments with a smile.",
      "04-anime-cool-senior-sister": "Stay calm; I will call out what matters.",
      "05-anime-warm-senior-sister": "No rush; I will make the next step clear.",
      "06-anime-youth-qingyin": "Fresh and quick, here is the current state.",
      "07-anime-clean-young-male": "Clean and direct, with the result up front.",
      "project-coding-professional": "When the code is done, I report the signal.",
      "project-product-warm": "Progress and tradeoffs, shared with care.",
      "project-learning-narrator": "Slow down, understand why, then move on with confidence.",
      "project-voice-lab-cute": "I will catch the interesting turns as they happen, and I may add a little extra color when it helps.",
    },
  },
  fr: {
    languageName: "Français",
    ui: {
      documentTitle: "Configuration vocale Codex",
      appTitle: "Configuration vocale du projet",
      language: "Langue",
      refreshProjects: "Actualiser les projets",
      autoAssignTitle: "Configuration automatique",
      autoAssignHelp: "La page utilise d'abord le nom et le chemin du projet ; sans correspondance, elle attribue un mode stable à partir du chemin pour varier les voix par projet.",
      autoMissing: "Configurer automatiquement les projets non configurés selon leurs caractéristiques",
      autoOverwrite: "Configurer automatiquement tous les projets selon leurs caractéristiques",
      autoAssignButton: "Écrire les configurations",
      fixedAddressTitle: "Adresse fixe",
      fixedAddressHelp: "Une fois activé, cette machine garde l'adresse de la page de configuration fixe au démarrage de Codex.",
      fixedAddressToggle: "Garder l'adresse de configuration fixe au démarrage de Codex",
      fixedAddressLoading: "Lecture de l'état de l'adresse fixe...",
      search: "Recherche",
      searchPlaceholder: "Nom ou chemin du projet",
      selectProject: "Choisir un projet",
      selectProjectHelp: "Après le démarrage du service local, les projets Codex configurables apparaissent ici.",
      notSelected: "Non sélectionné",
      projectVoiceMode: "Mode vocal du projet",
      defaultVoice: "Voix par défaut",
      preview: "Écouter",
      customVoiceTitle: "Générer une voix selon vos préférences",
      customVoiceHelp: "Nommez la voix, puis décrivez le son souhaité ; la page créera une source vocale à écouter et à enregistrer.",
      customVoiceName: "Nom de la voix",
      customVoiceNamePlaceholder: "Exemple : Point d'étape",
      customVoicePlaceholder: "Exemple : chaleureux, peu intrusif, comme un point d'étape produit.",
      generateCustomVoice: "Générer et écouter",
      saveCustomVoice: "Enregistrer",
      clearCustomVoice: "Effacer",
      customVoiceEmpty: "Aucun plan vocal personnalisé pour l'instant.",
      customVoiceNameRequired: "Nommez d'abord cette voix.",
      customVoicePromptRequired: "Écrivez d'abord une préférence vocale courte.",
      customVoiceGenerating: "Génération du plan vocal personnalisé...",
      customVoiceGenerated: "Plan vocal personnalisé généré et prêt à écouter.",
      customVoiceCleared: "Plan vocal personnalisé effacé.",
      customVoiceSummary: "Voix personnalisée : {label} · {voice} · Rate {rate} · Pitch {pitch}",
      notes: "Notes",
      notesPlaceholder: "Courte note pour les mainteneurs ou une future session Codex",
      disableVoiceForProject: "Désactiver totalement la voix pour ce projet",
      applyConfig: "Appliquer",
      copyJson: "Copier JSON",
      currentVoice: "Voix actuelle",
      pendingWrite: "À écrire",
      enabled: "Voix activée",
      disabled: "Voix désactivée",
      noTag: "Aucune étiquette",
      auto: "Auto",
      byStrategy: "Selon la stratégie",
      mode: "Mode",
      speech: "Lecture",
      voice: "Voix",
      style: "Style",
      notSpecified: "Non spécifié",
      resolvedByStrategy: "Résolu par stratégie",
      none: "Aucun",
      followVoiceMode: "Suivre le mode vocal",
      followModeVoice: "Voix par défaut du mode",
      noProjects: "Aucun projet correspondant.",
      fixedNotRead: "L'état de l'adresse fixe n'est pas encore chargé.",
      fixedUnsupported: "{platform} ne permet pas encore de fixer l'adresse depuis cette page ; lancez la commande manuellement.",
      fixedOn: "Activée",
      fixedOff: "Désactivée",
      readingConfig: "Lecture de la configuration locale...",
      configServiceStatus: "Le service a renvoyé {status}",
      readProjects: "{count} projets chargés.",
      noScannedProjects: "Aucun projet trouvé. Utilisez --workspace-root pour indiquer votre espace Codex.",
      chooseProjectFirst: "Choisissez d'abord un projet.",
      writingConfig: "Écriture de la configuration du projet...",
      writeFailed: "Échec de l'écriture : {status}",
      wrotePath: "Écrit dans {path}",
      noWritableProjects: "Aucun projet disponible pour l'écriture.",
      autoWritingOverwrite: "Écriture automatique pour tous les projets listés...",
      autoWritingMissing: "Écriture automatique pour les projets non configurés...",
      autoWriteFailed: "Échec de la configuration automatique : {status}",
      autoWroteAll: "{written} projets écrits.",
      autoWroteMissing: "{written} projets écrits, {skipped} projets déjà configurés ignorés.",
      fixedOpening: "Activation de l'adresse fixe...",
      fixedClosing: "Désactivation de l'adresse fixe...",
      fixedFailed: "Échec du réglage de l'adresse fixe : {status}",
      fixedOpened: "Adresse fixe activée.",
      fixedClosed: "Adresse fixe désactivée.",
      noPreviewVoice: "Aucune voix à écouter.",
      generating: "Génération",
      preparingPreview: "Préparation de l'écoute...",
      previewFailed: "Échec de l'écoute : {status}",
      playingSample: "Lecture d'une courte phrase d'écoute.",
      playingGenerated: "Lecture d'une courte phrase d'écoute.",
      previewReady: "L'aperçu est prêt. Utilisez le lecteur audio.",
      jsonCopied: "JSON copié.",
      copyFailed: "Accès au presse-papiers indisponible. Copiez le JSON manuellement.",
      connectFailed: "Impossible de se connecter au service local : {message}. Lancez scripts/start-config-ui au lieu d'ouvrir le fichier HTML directement.",
    },
    projectTags: {
      default_reserved: { name: "Compagnon discret", description: "Peu de notifications vocales, seulement aux moments clés, blocages et réponses finales.", identity: "Voix de personnage douce par défaut" },
      voice_lab_cute: { name: "Petit bavard vif", description: "Plus présent et joueur ; explique activement les progrès, découvertes et petits virages.", identity: "Voix de personnage vive et bavarde" },
      coding_quiet: { name: "Exécution silencieuse", description: "Reste discret pendant le code et les tests ; signale seulement les blocages et la fin.", identity: "Voix masculine stable pour projet de code" },
      product_warm: { name: "Point d'étape", description: "Signale les progrès et arbitrages aux étapes importantes.", identity: "Voix féminine chaleureuse pour produit" },
      learning_narrator: { name: "Explication pédagogique", description: "Explique les concepts, étapes et raisons pour l'apprentissage ou les configurations complexes.", identity: "Voix masculine détendue pour apprentissage" },
      silent_project: { name: "Silence total", description: "N'appelle aucun script vocal, y compris confirmations, choix Plan et réponses finales.", identity: "Voix désactivée" },
    },
    modes: {
      chatty_companion: "Mode bavard",
      steady_secretary: "Secrétaire stable",
      reserved_partner: "Partenaire discret",
      silent_executor: "Exécution silencieuse",
      teaching_narrator: "Narration pédagogique",
      voice_disabled: "Voix désactivée",
    },
    voiceStyles: {},
    previewSlogans: {
      "02-anime-soft-loli-character": "Un rappel léger rend la prochaine étape plus douce.",
      "A3-v3": "Je garde une voix douce, claire et brève.",
      "A1-relaxed-female-explainer": "Ralentissons, et le complexe devient clair.",
      "A3-v2-gentle-companion-lighter": "Je reste près de vous, tout en douceur.",
      "A5-casual-female-voiceover": "Un ton naturel, pour aller droit au point.",
      "01-anime-genki-heroine": "Prêt ? On fait avancer le projet. Dès qu'il y a du mouvement, je vous préviens.",
      "03-anime-sweet-idol": "Rendons ce projet un peu plus lumineux. Les bons moments méritent une voix souriante.",
      "04-anime-cool-senior-sister": "Restons calmes, je signale l'essentiel.",
      "05-anime-warm-senior-sister": "Pas de hâte, je clarifie la suite.",
      "06-anime-youth-qingyin": "Clair et rapide, voici l'état actuel.",
      "07-anime-clean-young-male": "Simple et direct, le résultat d'abord.",
      "project-coding-professional": "Quand le code est prêt, je donne le signal.",
      "project-product-warm": "Progrès et arbitrages, avec mesure.",
      "project-learning-narrator": "On ralentit, on comprend pourquoi, puis on avance avec confiance.",
      "project-voice-lab-cute": "Je repère les petits virages intéressants, et j'ajoute un peu de couleur quand c'est utile.",
    },
  },
  ja: {
    languageName: "日本語",
    ui: {
      documentTitle: "Codex 音声設定",
      appTitle: "プロジェクト音声設定",
      language: "言語",
      refreshProjects: "プロジェクトを更新",
      autoAssignTitle: "自動設定",
      autoAssignHelp: "まずプロジェクト名とパスのキーワードで判定し、該当しない場合はパスから安定したモードを割り当てます。",
      autoMissing: "未設定のプロジェクトを特性に応じて自動設定",
      autoOverwrite: "すべてのプロジェクトを特性に応じて自動設定",
      autoAssignButton: "設定を書き込む",
      fixedAddressTitle: "固定アドレス",
      fixedAddressHelp: "有効にすると、Codex 起動時に設定ページのアドレスを固定します。",
      fixedAddressToggle: "Codex 起動時に設定ページのアドレスを固定する",
      fixedAddressLoading: "固定アドレスの状態を読み込み中...",
      search: "検索",
      searchPlaceholder: "プロジェクト名またはパス",
      selectProject: "プロジェクトを選択",
      selectProjectHelp: "ローカル設定サービスを起動すると、設定可能な Codex プロジェクトがここに表示されます。",
      notSelected: "未選択",
      projectVoiceMode: "プロジェクト音声モード",
      defaultVoice: "既定の声",
      preview: "試聴",
      customVoiceTitle: "好みから読み上げ声を生成",
      customVoiceHelp: "先に声の名前を付けてから、このプロジェクトをどんな声にしたいか書くと、試聴して保存できる音声ソースを生成します。",
      customVoiceName: "声の名前",
      customVoiceNamePlaceholder: "例：節目レポート",
      customVoicePlaceholder: "例：やさしく、邪魔しすぎず、節目だけ落ち着いて報告。",
      generateCustomVoice: "生成して試聴",
      saveCustomVoice: "保存",
      clearCustomVoice: "クリア",
      customVoiceEmpty: "カスタム音声プランはまだありません。",
      customVoiceNameRequired: "先にこの声の名前を付けてください。",
      customVoicePromptRequired: "先に声の好みを少し書いてください。",
      customVoiceGenerating: "カスタム音声プランを生成中...",
      customVoiceGenerated: "カスタム音声プランを生成し、試聴できます。",
      customVoiceCleared: "カスタム音声プランをクリアしました。",
      customVoiceSummary: "カスタム音声：{label} · {voice} · Rate {rate} · Pitch {pitch}",
      notes: "メモ",
      notesPlaceholder: "保守担当者または今後の Codex セッション向けの短いメモ",
      disableVoiceForProject: "このプロジェクトでは音声を完全に無効化",
      applyConfig: "設定を適用",
      copyJson: "JSON をコピー",
      currentVoice: "現在の声",
      pendingWrite: "書き込み内容",
      enabled: "音声オン",
      disabled: "音声オフ",
      noTag: "タグ未設定",
      auto: "自動",
      byStrategy: "戦略に従う",
      mode: "モード",
      speech: "読み上げ",
      voice: "声",
      style: "スタイル",
      notSpecified: "未指定",
      resolvedByStrategy: "戦略で解決",
      none: "なし",
      followVoiceMode: "音声モードに従う",
      followModeVoice: "モード既定の声に従う",
      noProjects: "一致するプロジェクトがありません。",
      fixedNotRead: "固定アドレス状態はまだ読み込まれていません。",
      fixedUnsupported: "{platform} ではこのページから固定アドレスを設定できません。起動コマンドを手動で実行してください。",
      fixedOn: "有効",
      fixedOff: "無効",
      readingConfig: "ローカル設定を読み込み中...",
      configServiceStatus: "設定サービスが {status} を返しました",
      readProjects: "{count} 件のプロジェクトを読み込みました。",
      noScannedProjects: "プロジェクトが見つかりません。--workspace-root で Codex ワークスペースを指定してください。",
      chooseProjectFirst: "先にプロジェクトを選択してください。",
      writingConfig: "プロジェクト設定を書き込み中...",
      writeFailed: "書き込み失敗: {status}",
      wrotePath: "{path} に書き込みました",
      noWritableProjects: "書き込めるプロジェクトがありません。",
      autoWritingOverwrite: "一覧の全プロジェクトへ自動設定を書き込み中...",
      autoWritingMissing: "未設定プロジェクトへ自動設定を書き込み中...",
      autoWriteFailed: "自動設定に失敗しました: {status}",
      autoWroteAll: "{written} 件のプロジェクトを書き込みました。",
      autoWroteMissing: "{written} 件を書き込み、既存設定のある {skipped} 件をスキップしました。",
      fixedOpening: "固定アドレスを有効化中...",
      fixedClosing: "固定アドレスを無効化中...",
      fixedFailed: "固定アドレス設定に失敗しました: {status}",
      fixedOpened: "固定アドレスを有効化しました。",
      fixedClosed: "固定アドレスを無効化しました。",
      noPreviewVoice: "試聴できる声がありません。",
      generating: "生成中",
      preparingPreview: "試聴音声を準備中...",
      previewFailed: "試聴に失敗しました: {status}",
      playingSample: "短い試聴フレーズを再生中。",
      playingGenerated: "短い試聴フレーズを再生中。",
      previewReady: "試聴の準備ができました。音声コントロールで再生してください。",
      jsonCopied: "JSON をコピーしました。",
      copyFailed: "クリップボードを利用できません。JSON を手動で選択してコピーしてください。",
      connectFailed: "ローカル設定サービスに接続できません: {message}。HTML を直接開かず scripts/start-config-ui で起動してください。",
    },
    projectTags: {
      default_reserved: { name: "静かな伴走", description: "重要な節目、ブロック、最終返信だけ低頻度で読み上げます。", identity: "既定のかわいいキャラクター声" },
      voice_lab_cute: { name: "活発なおしゃべり", description: "少し多めに話し、進捗や発見、小さな変化を能動的に伝えます。", identity: "活発なおしゃべりキャラクター声" },
      coding_quiet: { name: "静かに実行", description: "コーディングやテスト中は静かにし、ブロックと完了時だけ報告します。", identity: "コード向け落ち着いた男性声" },
      product_warm: { name: "節目レポート", description: "重要な節目で進捗と判断を落ち着いて共有します。", identity: "プロダクト向け温かい女性声" },
      learning_narrator: { name: "教学解説", description: "学習や複雑な設定向けに、概念・手順・理由を説明します。", identity: "学習向けリラックスした男性声" },
      silent_project: { name: "完全ミュート", description: "確認、Plan 選択、最終返信を含め音声スクリプトを呼びません。", identity: "音声無効" },
    },
    modes: {
      chatty_companion: "おしゃべりモード",
      steady_secretary: "落ち着いた秘書",
      reserved_partner: "控えめな伴走",
      silent_executor: "静かな実行",
      teaching_narrator: "教学ナレーター",
      voice_disabled: "音声無効",
    },
    voiceStyles: {},
    previewSlogans: {
      "02-anime-soft-loli-character": "やさしく知らせて、次の一歩を軽くします。",
      "A3-v3": "あたたかく、短く、わかりやすく伝えます。",
      "A1-relaxed-female-explainer": "少しゆっくり、複雑さをほどきます。",
      "A3-v2-gentle-companion-lighter": "そっと寄り添い、進み具合を伝えます。",
      "A5-casual-female-voiceover": "自然なテンポで、要点をすばやく。",
      "01-anime-genki-heroine": "準備できたよ、前に進めよう！進展が出たら、すぐ知らせるね。",
      "03-anime-sweet-idol": "今日もプロジェクトを少し輝かせよう。いい瞬間は、明るく伝えるね。",
      "04-anime-cool-senior-sister": "落ち着いて、大事な点だけ伝えます。",
      "05-anime-warm-senior-sister": "急がず、次の一歩をはっきりと。",
      "06-anime-youth-qingyin": "軽やかに、今の状態を確認します。",
      "07-anime-clean-young-male": "すっきりと、結果から伝えます。",
      "project-coding-professional": "コードの結果だけ、確実に報告します。",
      "project-product-warm": "進捗と判断を、やさしく共有します。",
      "project-learning-narrator": "ゆっくり理由を理解して、それから安心して進みましょう。",
      "project-voice-lab-cute": "面白い変化は、すぐに知らせます。必要なら、少し楽しく補足します。",
    },
  },
  ko: {
    languageName: "한국어",
    ui: {
      documentTitle: "Codex 음성 설정",
      appTitle: "프로젝트 음성 설정",
      language: "언어",
      refreshProjects: "프로젝트 새로고침",
      autoAssignTitle: "자동 설정",
      autoAssignHelp: "먼저 프로젝트 이름과 경로 키워드로 모드를 고르고, 없으면 경로를 기준으로 안정적인 모드를 배정합니다.",
      autoMissing: "아직 설정되지 않은 프로젝트를 특성에 맞게 자동 설정",
      autoOverwrite: "모든 프로젝트를 특성에 맞게 자동 설정",
      autoAssignButton: "프로젝트 설정 쓰기",
      fixedAddressTitle: "고정 주소",
      fixedAddressHelp: "켜면 Codex 시작 시 이 컴퓨터가 설정 페이지 주소를 고정합니다.",
      fixedAddressToggle: "Codex 시작 시 설정 페이지 주소 고정",
      fixedAddressLoading: "고정 주소 상태를 읽는 중...",
      search: "검색",
      searchPlaceholder: "프로젝트 이름 또는 경로",
      selectProject: "프로젝트 선택",
      selectProjectHelp: "로컬 설정 서비스가 시작되면 설정 가능한 Codex 프로젝트가 여기에 표시됩니다.",
      notSelected: "선택 안 됨",
      projectVoiceMode: "프로젝트 음성 모드",
      defaultVoice: "기본 음성",
      preview: "미리 듣기",
      customVoiceTitle: "취향으로 낭독 음성 생성",
      customVoiceHelp: "먼저 음성 이름을 정한 뒤, 이 프로젝트가 어떤 느낌으로 들리면 좋을지 적으면 미리 듣고 저장할 수 있는 음성 소스를 만듭니다.",
      customVoiceName: "음성 이름",
      customVoiceNamePlaceholder: "예: 단계 보고 음성",
      customVoicePlaceholder: "예: 따뜻하게, 방해는 적게, 제품 단계 보고처럼.",
      generateCustomVoice: "생성하고 듣기",
      saveCustomVoice: "프로젝트에 저장",
      clearCustomVoice: "지우기",
      customVoiceEmpty: "아직 사용자 지정 음성方案이 없습니다.",
      customVoiceNameRequired: "먼저 이 음성의 이름을 정해주세요.",
      customVoicePromptRequired: "먼저 원하는 음성 느낌을 짧게 적어주세요.",
      customVoiceGenerating: "사용자 지정 음성方案 생성 중...",
      customVoiceGenerated: "사용자 지정 음성方案이 생성되어 미리 들을 수 있습니다.",
      customVoiceCleared: "사용자 지정 음성方案을 지웠습니다.",
      customVoiceSummary: "사용자 지정 음성: {label} · {voice} · Rate {rate} · Pitch {pitch}",
      notes: "메모",
      notesPlaceholder: "관리자 또는 다음 Codex 세션을 위한 짧은 메모",
      disableVoiceForProject: "이 프로젝트에서 음성 완전 비활성화",
      applyConfig: "설정 적용",
      copyJson: "JSON 복사",
      currentVoice: "현재 음성",
      pendingWrite: "저장될 내용",
      enabled: "음성 켜짐",
      disabled: "음성 꺼짐",
      noTag: "태그 없음",
      auto: "자동",
      byStrategy: "전략 따름",
      mode: "모드",
      speech: "낭독",
      voice: "음성",
      style: "스타일",
      notSpecified: "지정 안 됨",
      resolvedByStrategy: "전략으로 결정",
      none: "없음",
      followVoiceMode: "음성 모드 따름",
      followModeVoice: "모드 기본 음성 따름",
      noProjects: "일치하는 프로젝트가 없습니다.",
      fixedNotRead: "고정 주소 상태를 아직 읽지 못했습니다.",
      fixedUnsupported: "{platform}에서는 아직 이 페이지에서 고정 주소를 설정할 수 없습니다. 시작 명령을 수동으로 실행하세요.",
      fixedOn: "켜짐",
      fixedOff: "꺼짐",
      readingConfig: "로컬 설정을 읽는 중...",
      configServiceStatus: "설정 서비스가 {status}를 반환했습니다",
      readProjects: "{count}개 프로젝트를 읽었습니다.",
      noScannedProjects: "프로젝트를 찾지 못했습니다. --workspace-root로 Codex 작업공간을 지정하세요.",
      chooseProjectFirst: "먼저 프로젝트를 선택하세요.",
      writingConfig: "프로젝트 설정을 쓰는 중...",
      writeFailed: "쓰기 실패: {status}",
      wrotePath: "{path}에 썼습니다",
      noWritableProjects: "현재 쓸 수 있는 프로젝트가 없습니다.",
      autoWritingOverwrite: "목록의 모든 프로젝트에 자동 설정을 쓰는 중...",
      autoWritingMissing: "미설정 프로젝트에 자동 설정을 쓰는 중...",
      autoWriteFailed: "자동 설정 실패: {status}",
      autoWroteAll: "{written}개 프로젝트에 썼습니다.",
      autoWroteMissing: "{written}개 프로젝트에 쓰고, 기존 설정이 있는 {skipped}개를 건너뛰었습니다.",
      fixedOpening: "고정 주소를 켜는 중...",
      fixedClosing: "고정 주소를 끄는 중...",
      fixedFailed: "고정 주소 설정 실패: {status}",
      fixedOpened: "고정 주소를 켰습니다.",
      fixedClosed: "고정 주소를 껐습니다.",
      noPreviewVoice: "미리 들을 음성이 없습니다.",
      generating: "생성 중",
      preparingPreview: "음성 미리 듣기를 준비 중...",
      previewFailed: "미리 듣기 실패: {status}",
      playingSample: "짧은 음성 슬로건을 재생 중입니다.",
      playingGenerated: "짧은 음성 슬로건을 재생 중입니다.",
      previewReady: "미리 듣기가 준비되었습니다. 오디오 컨트롤로 재생하세요.",
      jsonCopied: "JSON을 복사했습니다.",
      copyFailed: "클립보드 접근이 불가합니다. JSON을 직접 선택해 복사하세요.",
      connectFailed: "로컬 설정 서비스에 연결할 수 없습니다: {message}. HTML 파일을 직접 열지 말고 scripts/start-config-ui로 시작하세요.",
    },
    projectTags: {
      default_reserved: { name: "조용한 동행", description: "핵심 지점, 막힘, 최종 답변에서만 낮은 빈도로 말합니다.", identity: "기본 귀여운 캐릭터 음성" },
      voice_lab_cute: { name: "활발한 수다", description: "조금 더 자주 말하며 진행, 발견, 작은 전환점을 먼저 알려줍니다.", identity: "활발한 수다 캐릭터 음성" },
      coding_quiet: { name: "조용한 실행", description: "코딩과 테스트 중에는 조용히, 막힘과 완료 시에만 보고합니다.", identity: "코딩 프로젝트용 안정적인 남성 음성" },
      product_warm: { name: "단계 보고", description: "중요 단계에서 진행과 판단을 차분히 공유합니다.", identity: "제품 프로젝트용 따뜻한 여성 음성" },
      learning_narrator: { name: "학습 설명", description: "학습이나 복잡한 설정에 맞게 개념, 단계, 이유를 설명합니다.", identity: "학습 프로젝트용 편안한 남성 음성" },
      silent_project: { name: "완전 무음", description: "확인, Plan 선택, 최종 답변을 포함해 음성 스크립트를 호출하지 않습니다.", identity: "음성 비활성화" },
    },
    modes: {
      chatty_companion: "수다 모드",
      steady_secretary: "차분한 비서",
      reserved_partner: "절제된 동행",
      silent_executor: "조용한 실행",
      teaching_narrator: "학습 내레이터",
      voice_disabled: "음성 비활성화",
    },
    voiceStyles: {},
    previewSlogans: {
      "02-anime-soft-loli-character": "가볍게 알려드릴게요, 다음 단계도 부드럽게.",
      "A3-v3": "따뜻하고 짧게, 핵심을 전할게요.",
      "A1-relaxed-female-explainer": "조금 천천히, 복잡함을 풀어볼게요.",
      "A3-v2-gentle-companion-lighter": "조용히 곁에서 진행을 알려드릴게요.",
      "A5-casual-female-voiceover": "자연스러운 속도로 핵심만 전할게요.",
      "01-anime-genki-heroine": "준비됐어요, 앞으로 밀어볼까요! 진전이 보이면 바로 알려드릴게요.",
      "03-anime-sweet-idol": "오늘도 프로젝트를 더 빛나게 해봐요. 좋은 순간은 밝게 전할게요.",
      "04-anime-cool-senior-sister": "차분하게, 중요한 것만 말할게요.",
      "05-anime-warm-senior-sister": "서두르지 말고, 다음 단계를 분명히 해요.",
      "06-anime-youth-qingyin": "가볍고 빠르게 현재 상태를 확인해요.",
      "07-anime-clean-young-male": "깔끔하게, 결과부터 전할게요.",
      "project-coding-professional": "코드가 끝나면 핵심 결과만 보고합니다.",
      "project-product-warm": "진행과 판단을 따뜻하게 공유할게요.",
      "project-learning-narrator": "천천히 이유를 이해하고, 그다음 자신 있게 나아가요.",
      "project-voice-lab-cute": "흥미로운 변화는 바로 알려드릴게요. 필요하면 조금 더 생생하게 덧붙일게요.",
    },
  },
};

const els = {
  refreshButton: document.querySelector("#refreshButton"),
  languageSelect: document.querySelector("#languageSelect"),
  autoAssignButton: document.querySelector("#autoAssignButton"),
  autoApplyModes: Array.from(document.querySelectorAll('input[name="autoApplyMode"]')),
  configUiAutostart: document.querySelector("#configUiAutostart"),
  autostartDetails: document.querySelector("#autostartDetails"),
  projectSearch: document.querySelector("#projectSearch"),
  projectList: document.querySelector("#projectList"),
  workspaceLabel: document.querySelector("#workspaceLabel"),
  selectedProjectName: document.querySelector("#selectedProjectName"),
  selectedProjectPath: document.querySelector("#selectedProjectPath"),
  voiceStatus: document.querySelector("#voiceStatus"),
  configForm: document.querySelector("#configForm"),
  projectTagSelect: document.querySelector("#projectTagSelect"),
  projectTagCards: document.querySelector("#projectTagCards"),
  strategySelect: document.querySelector("#strategySelect"),
  settingsFileSelect: document.querySelector("#settingsFileSelect"),
  modeSelect: document.querySelector("#modeSelect"),
  voiceSelect: document.querySelector("#voiceSelect"),
  voicePreviewButton: document.querySelector("#voicePreviewButton"),
  voicePreviewAudio: document.querySelector("#voicePreviewAudio"),
  customVoiceName: document.querySelector("#customVoiceName"),
  customVoicePrompt: document.querySelector("#customVoicePrompt"),
  generateCustomVoiceButton: document.querySelector("#generateCustomVoiceButton"),
  saveCustomVoiceButton: document.querySelector("#saveCustomVoiceButton"),
  clearCustomVoiceButton: document.querySelector("#clearCustomVoiceButton"),
  customVoiceSummary: document.querySelector("#customVoiceSummary"),
  voiceIdentityLabel: document.querySelector("#voiceIdentityLabel"),
  notesInput: document.querySelector("#notesInput"),
  suppressAllSpeech: document.querySelector("#suppressAllSpeech"),
  applyButton: document.querySelector("#applyButton"),
  copyJsonButton: document.querySelector("#copyJsonButton"),
  voiceDetails: document.querySelector("#voiceDetails"),
  jsonPreview: document.querySelector("#jsonPreview"),
  messageBar: document.querySelector("#messageBar"),
};

function setMessage(message, kind = "") {
  els.messageBar.textContent = message;
  els.messageBar.className = `message-bar ${kind}`.trim();
}

function option(label, value) {
  const item = document.createElement("option");
  item.value = value ?? "";
  item.textContent = label;
  return item;
}

function fillSelect(select, items, selectedValue) {
  select.innerHTML = "";
  for (const item of items) {
    select.append(option(item.label, item.value));
  }
  select.value = selectedValue ?? "";
}

function normalizeUiLocale(locale, fallback = "zh-CN") {
  if (TRANSLATIONS[locale]) return locale;
  return TRANSLATIONS[fallback] ? fallback : "zh-CN";
}

function setLocaleValue(locale) {
  state.locale = normalizeUiLocale(locale);
  localStorage.setItem("codexVoiceConfigLocale", state.locale);
  els.languageSelect.value = state.locale;
}

function localeDisplayName(locale = state.locale) {
  const normalized = normalizeUiLocale(locale, state.locale);
  return TRANSLATIONS[normalized]?.languageName ?? normalized;
}

function localePack() {
  return TRANSLATIONS[state.locale] ?? TRANSLATIONS["zh-CN"];
}

function t(key, vars = {}) {
  const text = localePack().ui[key] ?? TRANSLATIONS["zh-CN"].ui[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}

function localizeProjectTag(key, tag = {}) {
  const localized = localePack().projectTags[key] ?? TRANSLATIONS["zh-CN"].projectTags[key] ?? {};
  return {
    name: localized.name ?? tag.displayName ?? key,
    description: localized.description ?? tag.description ?? key,
    identity: localized.identity ?? tag.voiceIdentityLabel ?? "",
  };
}

function localizeMode(key, mode = {}) {
  if (!key) return "";
  return localePack().modes[key] ?? TRANSLATIONS["zh-CN"].modes[key] ?? mode.displayName ?? key;
}

function localizeVoiceStyle(profileName, fallback = "") {
  return (
    localePack().voiceStyles[profileName] ??
    TRANSLATIONS.en.voiceStyles[profileName] ??
    TRANSLATIONS["zh-CN"].voiceStyles[profileName] ??
    fallback
  );
}

function previewSlogan(profileName) {
  return (
    localePack().previewSlogans?.[profileName] ??
    TRANSLATIONS.en.previewSlogans?.[profileName] ??
    TRANSLATIONS["zh-CN"].previewSlogans?.[profileName] ??
    "Ready when you are."
  );
}

function normalizePromptText(value) {
  return (value || "").trim().toLowerCase();
}

function promptHas(prompt, terms) {
  return terms.some((term) => prompt.includes(term));
}

function localeCustomVoice(locale, trait) {
  const voices = {
    "zh-CN": {
      warm: "zh-CN-XiaoxiaoNeural",
      lively: "zh-CN-XiaoyiNeural",
      professional: "zh-CN-YunyangNeural",
      narrator: "zh-CN-YunxiNeural",
      calm: "zh-CN-XiaoxiaoNeural",
      aged_female: "zh-CN-liaoning-XiaobeiNeural",
    },
    en: {
      warm: "en-US-JennyNeural",
      lively: "en-US-JennyNeural",
      professional: "en-US-GuyNeural",
      narrator: "en-US-AriaNeural",
      calm: "en-US-JennyNeural",
      aged_female: "en-US-MichelleNeural",
    },
    fr: {
      warm: "fr-FR-DeniseNeural",
      lively: "fr-FR-DeniseNeural",
      professional: "fr-FR-HenriNeural",
      narrator: "fr-FR-DeniseNeural",
      calm: "fr-FR-DeniseNeural",
      aged_female: "fr-FR-DeniseNeural",
    },
    ja: {
      warm: "ja-JP-NanamiNeural",
      lively: "ja-JP-NanamiNeural",
      professional: "ja-JP-KeitaNeural",
      narrator: "ja-JP-NanamiNeural",
      calm: "ja-JP-NanamiNeural",
      aged_female: "ja-JP-NanamiNeural",
    },
    ko: {
      warm: "ko-KR-SunHiNeural",
      lively: "ko-KR-SunHiNeural",
      professional: "ko-KR-InJoonNeural",
      narrator: "ko-KR-SunHiNeural",
      calm: "ko-KR-SunHiNeural",
      aged_female: "ko-KR-SunHiNeural",
    },
  };
  const pack = voices[locale] ?? voices["zh-CN"];
  return pack[trait] ?? pack.warm;
}

function customVoiceLabel(trait) {
  const labels = {
    "zh-CN": {
      lively: "偏活泼的自定义声音",
      professional: "偏稳重的自定义声音",
      narrator: "偏讲解的自定义声音",
      calm: "偏安静的自定义声音",
      aged_female: "慢速沧桑女性自定义声音",
      warm: "偏温和的自定义声音",
    },
    en: {
      lively: "Lively custom voice",
      professional: "Steady custom voice",
      narrator: "Narration custom voice",
      calm: "Quiet custom voice",
      aged_female: "Slow weathered female custom voice",
      warm: "Warm custom voice",
    },
    fr: {
      lively: "Voix personnalisée vive",
      professional: "Voix personnalisée posée",
      narrator: "Voix personnalisée narrative",
      calm: "Voix personnalisée calme",
      aged_female: "Voix féminine lente et patinée",
      warm: "Voix personnalisée chaleureuse",
    },
    ja: {
      lively: "活発なカスタム音声",
      professional: "落ち着いたカスタム音声",
      narrator: "解説向けカスタム音声",
      calm: "静かなカスタム音声",
      aged_female: "ゆっくり渋い女性カスタム音声",
      warm: "やさしいカスタム音声",
    },
    ko: {
      lively: "활발한 사용자 지정 음성",
      professional: "차분한 사용자 지정 음성",
      narrator: "설명형 사용자 지정 음성",
      calm: "조용한 사용자 지정 음성",
      aged_female: "느리고 세월감 있는 여성 음성",
      warm: "따뜻한 사용자 지정 음성",
    },
  };
  return labels[state.locale]?.[trait] ?? labels.en[trait] ?? labels.en.warm;
}

function customVoiceStyle(label, trait) {
  const base = customVoiceLabel(trait);
  const name = (label || "").trim();
  return name && name !== base ? `${name} · ${base}` : base;
}

function customVoiceSlogan(trait) {
  const slogans = {
    "zh-CN": {
      lively: "有新进展我会多说一点，把有趣的转折也带上。",
      professional: "我会少说废话，只把关键结果讲清楚。",
      narrator: "我会放慢一点，把原因、步骤和下一步讲明白。",
      calm: "我会安静一点，只在需要时轻声提醒。",
      aged_female: "我会把语速放慢，把声音压低一点，尽量贴近沧桑感。",
      warm: "我会温和地陪你，把进展和取舍说清楚。",
    },
    en: {
      lively: "I will add a little color when the project starts to move.",
      professional: "I will keep it brief and report only the signal.",
      narrator: "I will slow down, explain the why, and guide the next step.",
      calm: "I will stay quiet, then speak gently when it matters.",
      aged_female: "I will slow down and lower the tone for a more weathered feel.",
      warm: "I will keep the tone warm while making progress clear.",
    },
    fr: {
      lively: "J'ajoute un peu de couleur quand le projet bouge.",
      professional: "Je reste bref et je signale seulement l'essentiel.",
      narrator: "Je ralentis, j'explique le pourquoi, puis la suite.",
      calm: "Je reste discret et je parle doucement au bon moment.",
      aged_female: "Je ralentis et baisse le ton pour une couleur plus patinée.",
      warm: "Je garde un ton chaleureux pour clarifier l'avancement.",
    },
    ja: {
      lively: "動きが出たら、少し楽しく補足します。",
      professional: "余計なことは控え、重要な結果だけ伝えます。",
      narrator: "理由をゆっくり説明して、次の一歩へ案内します。",
      calm: "静かに待ち、大事な時だけそっと知らせます。",
      aged_female: "少し低く、ゆっくりした声で、年輪のある雰囲気に寄せます。",
      warm: "やさしい声で、進捗と判断をわかりやすく伝えます。",
    },
    ko: {
      lively: "프로젝트가 움직이면 조금 더 생생하게 전할게요.",
      professional: "짧고 분명하게, 핵심 결과만 보고합니다.",
      narrator: "천천히 이유를 설명하고 다음 단계를 안내할게요.",
      calm: "조용히 있다가 필요할 때 부드럽게 알려드릴게요.",
      aged_female: "조금 낮고 느린 톤으로 세월감 있는 느낌에 가깝게 말할게요.",
      warm: "따뜻한 톤으로 진행과 판단을 분명히 전할게요.",
    },
  };
  return slogans[state.locale]?.[trait] ?? slogans.en[trait] ?? slogans.en.warm;
}

function generateCustomVoicePlan(prompt, label) {
  const normalized = normalizePromptText(prompt);
  let trait = "warm";
  if (promptHas(normalized, ["苍老", "沙哑", "沧桑", "年迈", "老人", "老年", "老奶奶", "老妇", "老妪", "低沉", "粗粝", "烟嗓", "慢速", "语速慢", "慢一点", "aged", "elderly", "old", "weathered", "hoarse", "husky", "raspy", "slow female", "vieill", "rauque", "âgé", "âgée", "年配", "しわがれ", "渋い", "늙", "허스키", "느린", "연륜"])) {
    trait = "aged_female";
  } else if (promptHas(normalized, ["话痨", "多说", "活泼", "元气", "可爱", "energetic", "lively", "chatty", "playful", "vif", "bavard", "活発", "おしゃべり", "활발", "수다"])) {
    trait = "lively";
  } else if (promptHas(normalized, ["稳重", "专业", "秘书", "少说", "代码", "professional", "steady", "brief", "coding", "posé", "professionnel", "落ち着", "短く", "차분", "전문"])) {
    trait = "professional";
  } else if (promptHas(normalized, ["教学", "讲解", "解释", "旁白", "narrator", "teaching", "explain", "expliquer", "pédagog", "解説", "説明", "설명", "학습"])) {
    trait = "narrator";
  } else if (promptHas(normalized, ["安静", "静默", "轻声", "少打扰", "quiet", "silent", "calm", "discret", "calme", "静か", "控えめ", "조용", "적게"])) {
    trait = "calm";
  }

  const params = {
    lively: { rate: "+7%", pitch: "+3Hz" },
    professional: { rate: "-3%", pitch: "-2Hz" },
    narrator: { rate: "-5%", pitch: "-2Hz" },
    calm: { rate: "-4%", pitch: "-1Hz" },
    aged_female: { rate: "-22%", pitch: "-9Hz" },
    warm: { rate: "+0%", pitch: "+0Hz" },
  }[trait];

  return {
    profileName: "custom_project_voice",
    label,
    trait,
    prompt,
    locale: state.locale,
    voice: localeCustomVoice(state.locale, trait),
    rate: params.rate,
    pitch: params.pitch,
    style: customVoiceStyle(label, trait),
    previewText: customVoiceSlogan(trait),
  };
}

function customVoiceSummaryText(customVoice = state.customVoiceDraft || state.customVoice) {
  if (!customVoice) return t("customVoiceEmpty");
  return t("customVoiceSummary", {
    label: customVoice.label,
    voice: customVoice.voice,
    rate: customVoice.rate,
    pitch: customVoice.pitch,
  });
}

function retargetCustomVoiceForCurrentLocale(customVoice) {
  if (!customVoice) return false;
  const trait = customVoice.trait || "warm";
  const label = customVoice.label || customVoice.profileName || "Custom voice";
  customVoice.locale = state.locale;
  customVoice.voice = localeCustomVoice(state.locale, trait);
  customVoice.style = customVoiceStyle(label, trait);
  customVoice.previewText = customVoiceSlogan(trait);
  return true;
}

function retargetCustomVoicesForCurrentLocale() {
  const updatedDraft = retargetCustomVoiceForCurrentLocale(state.customVoiceDraft);
  const updatedSaved = retargetCustomVoiceForCurrentLocale(state.customVoice);
  if (updatedDraft || updatedSaved) {
    els.customVoiceSummary.textContent = customVoiceSummaryText();
  }
}

function applyStaticTranslations() {
  document.documentElement.lang = state.locale;
  document.title = t("documentTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  els.refreshButton.title = t("refreshProjects");
  els.projectTagCards.setAttribute("aria-label", t("projectVoiceMode"));
  if (!state.selectedProject) {
    els.selectedProjectName.textContent = t("selectProject");
    els.selectedProjectPath.textContent = t("selectProjectHelp");
    els.voiceStatus.textContent = t("notSelected");
  }
}

function refreshLocalizedControls() {
  applyStaticTranslations();
  els.customVoiceSummary.textContent = customVoiceSummaryText();

  if (state.bootstrap) {
    if (state.selectedProject) {
      const selectedVoice = els.voiceSelect.value;
      const selectedMode = els.modeSelect.value;
      const selectedStrategy = els.strategySelect.value;
      const selectedTag = els.projectTagSelect.value;
      fillSelect(
        els.projectTagSelect,
        Object.entries(projectTagMap()).map(([key, value]) => ({
          label: `${localizeProjectTag(key, value).name} · ${key}`,
          value: key,
        })),
        selectedTag,
      );
      fillSelect(
        els.strategySelect,
        Object.entries(strategyMap()).map(([key, value]) => ({
          label: `${value.displayName ?? key} · ${key}`,
          value: key,
        })),
        selectedStrategy,
      );
      fillSelect(
        els.modeSelect,
        [
          { label: t("followVoiceMode"), value: "" },
          ...Object.entries(modeMap()).map(([key, value]) => ({
            label: `${localizeMode(key, value)} · ${key}`,
            value: key,
          })),
        ],
        selectedMode,
      );
      renderVoiceSelect(selectedVoice);
      const tag = projectTagMap()[selectedTag] ?? {};
      const localized = localizeProjectTag(selectedTag, tag);
      els.voiceIdentityLabel.value = localized.identity || tag.voiceIdentityLabel || els.voiceIdentityLabel.value;
      els.notesInput.value = localized.description || tag.description || els.notesInput.value;
    }

    renderProjectTagCards(els.projectTagSelect.value);
    renderProjects();
    renderJsonPreview();
    renderAutostartStatus(state.bootstrap.autostart);
  }
}

function setLocale(locale) {
  const previousLocale = state.locale;
  setLocaleValue(locale);
  if (state.locale !== previousLocale) {
    void cleanupDraftPreview();
    retargetCustomVoicesForCurrentLocale();
  }
  refreshLocalizedControls();
}

function autoApplyOverwrite() {
  return document.querySelector('input[name="autoApplyMode"]:checked')?.value === "overwrite";
}

function renderAutostartStatus(autostart) {
  if (!autostart) {
    els.configUiAutostart.disabled = true;
    els.autostartDetails.textContent = t("fixedNotRead");
    return;
  }

  els.configUiAutostart.checked = Boolean(autostart.enabled);
  els.configUiAutostart.disabled = !autostart.supported;

  if (!autostart.supported) {
    els.autostartDetails.textContent = t("fixedUnsupported", { platform: autostart.platform });
    return;
  }

  const stateText = autostart.enabled ? t("fixedOn") : t("fixedOff");
  els.autostartDetails.textContent = `${stateText} · ${autostart.mechanism} · ${autostart.url}`;
}

function renderProjectTagCards(selectedValue) {
  els.projectTagCards.innerHTML = "";
  for (const [key, tag] of Object.entries(projectTagMap())) {
    const localized = localizeProjectTag(key, tag);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-card ${key === selectedValue ? "active" : ""}`.trim();
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", key === selectedValue ? "true" : "false");
    button.dataset.tag = key;
    button.innerHTML = `
      <strong></strong>
      <span></span>
    `;
    button.querySelector("strong").textContent = localized.name;
    button.querySelector("span").textContent = localized.description;
    button.addEventListener("click", () => {
      els.projectTagSelect.value = key;
      applyProjectTagDefaults();
    });
    els.projectTagCards.append(button);
  }
}

function strategyMap() {
  return state.bootstrap?.strategiesConfig?.strategies ?? {};
}

function projectTagMap() {
  return state.bootstrap?.strategiesConfig?.projectTags ?? {};
}

function modeMap() {
  return state.bootstrap?.modesConfig?.modes ?? {};
}

function voiceMap() {
  return state.bootstrap?.modesConfig?.voiceProfiles ?? {};
}

function isCustomVoiceSelected() {
  return Boolean(state.customVoice) && els.voiceSelect.value === CUSTOM_VOICE_OPTION_VALUE;
}

function customVoiceDisplayName(customVoice = state.customVoice) {
  return (customVoice?.label || customVoice?.profileName || "Custom voice").trim();
}

function renderVoiceSelect(selectedValue) {
  const items = [{ label: t("followModeVoice"), value: "" }];
  if (state.customVoice) {
    items.push({
      label: `${customVoiceDisplayName()} · ${state.customVoice.voice}`,
      value: CUSTOM_VOICE_OPTION_VALUE,
    });
  }
  items.push(
    ...Object.entries(voiceMap()).map(([key, value]) => ({
      label: `${key} · ${value.voice} · ${localizeVoiceStyle(key, value.style ?? "")}`,
      value: key,
    })),
  );
  fillSelect(els.voiceSelect, items, selectedValue ?? (state.customVoice ? CUSTOM_VOICE_OPTION_VALUE : ""));
}

function selectedProjectTag() {
  return projectTagMap()[els.projectTagSelect.value] ?? {};
}

function settingsPayload() {
  const projectTag = els.projectTagSelect.value || state.bootstrap?.strategiesConfig?.defaultProjectTag || "default_reserved";
  const tag = projectTagMap()[projectTag] ?? {};
  const localized = localizeProjectTag(projectTag, tag);
  const strategy = tag.strategy ?? els.strategySelect.value;
  let modeOverride = tag.modeOverride ?? els.modeSelect.value ?? null;
  const customVoiceSelected = isCustomVoiceSelected();
  let voiceOverride = customVoiceSelected ? null : els.voiceSelect.value || tag.voiceOverride || null;
  let suppressAllSpeech = els.suppressAllSpeech.checked || Boolean(tag.suppressAllSpeech);

  if (projectTag === "silent_project" || strategy === "voice_disabled" || modeOverride === "voice_disabled") {
    modeOverride = "voice_disabled";
    voiceOverride = null;
    suppressAllSpeech = true;
  }

  const payload = {
    projectPath: state.selectedProject?.path ?? "",
    settingsFile: els.settingsFileSelect.value || "voice-project-settings.json",
    projectTag,
    strategy,
    modeOverride,
    voiceOverride,
    voiceIdentityLabel: customVoiceSelected ? customVoiceDisplayName() : els.voiceIdentityLabel.value.trim() || localized.identity || tag.voiceIdentityLabel || null,
    voiceLocale: state.locale,
    suppressAllSpeech,
    notes: els.notesInput.value.trim() || localized.description || tag.description || null,
  };

  if (customVoiceSelected && !suppressAllSpeech) {
    payload.customVoice = state.customVoice;
  }

  return payload;
}

function resolvedVoiceProfileName() {
  if (isCustomVoiceSelected()) return state.customVoice.profileName;
  const payload = settingsPayload();
  const tag = projectTagMap()[payload.projectTag] ?? {};
  const strategy = strategyMap()[payload.strategy] ?? {};
  return payload.voiceOverride ?? tag.voiceOverride ?? strategy.voiceProfile ?? "";
}

function resolvedVoiceObject(profileName) {
  if (isCustomVoiceSelected() && profileName === state.customVoice.profileName) {
    return state.customVoice;
  }
  return profileName ? voiceMap()[profileName] : null;
}

function renderJsonPreview() {
  const payload = settingsPayload();
  const preview = {
    projectTag: payload.projectTag,
    strategy: payload.strategy,
    modeOverride: payload.modeOverride,
    voiceOverride: payload.voiceOverride,
    voiceIdentityLabel: payload.voiceIdentityLabel,
    voiceLocale: payload.voiceLocale,
    suppressAllSpeech: payload.suppressAllSpeech,
  };

  if (payload.notes) {
    preview.notes = payload.notes;
  }

  if (payload.customVoice) {
    preview.customVoice = payload.customVoice;
  }

  els.jsonPreview.textContent = JSON.stringify(preview, null, 2);
  renderVoiceDetails();
}

function renderVoiceDetails() {
  const payload = settingsPayload();
  const resolvedVoiceProfile = resolvedVoiceProfileName();
  const voice = resolvedVoiceObject(resolvedVoiceProfile);
  const tag = projectTagMap()[payload.projectTag] ?? {};
  const strategy = strategyMap()[payload.strategy] ?? {};
  const mode = payload.modeOverride ? modeMap()[payload.modeOverride] : modeMap()[strategy.mode];
  const modeKey = payload.modeOverride || strategy.mode;
  const rows = [
    [t("mode"), localizeProjectTag(payload.projectTag, tag).name],
    [t("speech"), localizeMode(modeKey, mode) || modeKey || t("notSpecified")],
    [t("voice"), isCustomVoiceSelected() ? customVoiceDisplayName() : resolvedVoiceProfile || t("notSpecified")],
    [t("language"), localeDisplayName(payload.voiceLocale)],
    ["Voice", voice?.voice ?? t("resolvedByStrategy")],
    ["Rate", voice?.rate ?? t("resolvedByStrategy")],
    ["Pitch", voice?.pitch ?? t("resolvedByStrategy")],
    [t("style"), isCustomVoiceSelected() ? state.customVoice.style : resolvedVoiceProfile ? localizeVoiceStyle(resolvedVoiceProfile, voice?.style ?? strategy.description ?? "") : strategy.description ?? ""],
  ];

  els.voiceDetails.innerHTML = "";
  for (const [key, value] of rows) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value || t("none");
    els.voiceDetails.append(dt, dd);
  }

  const voiceDisabled = !resolvedVoiceProfile || payload.suppressAllSpeech;
  els.voiceSelect.disabled = payload.suppressAllSpeech;
  els.voicePreviewButton.disabled = voiceDisabled;
}

function renderProjects() {
  const query = els.projectSearch.value.trim().toLowerCase();
  const projects = state.projects.filter((project) => {
    if (!query) return true;
    return `${project.name} ${project.path}`.toLowerCase().includes(query);
  });

  els.projectList.innerHTML = "";
  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "meta-line";
    empty.textContent = t("noProjects");
    els.projectList.append(empty);
    return;
  }

  for (const project of projects) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `project-card ${state.selectedProject?.path === project.path ? "active" : ""}`.trim();
    const enabled = project.effective.voiceEnabled;
    button.innerHTML = `
      <strong></strong>
      <span class="meta-line"></span>
      <span class="badge-row">
        <span class="badge ${enabled ? "enabled" : "disabled"}">${enabled ? t("enabled") : t("disabled")}</span>
        <span class="badge"></span>
        <span class="badge"></span>
      </span>
    `;
    button.querySelector("strong").textContent = project.name;
    button.querySelector(".meta-line").textContent = project.path;
    const badges = button.querySelectorAll(".badge:not(.enabled):not(.disabled)");
    badges[0].textContent = project.effective.projectTag
      ? localizeProjectTag(project.effective.projectTag, projectTagMap()[project.effective.projectTag]).name
      : t("noTag");
    const voiceBadge = project.effective.customVoice?.label || project.effective.voiceIdentityLabel || project.effective.voiceProfile || t("byStrategy");
    badges[1].textContent =
      project.effective.projectTagSource?.startsWith("auto")
        ? `${t("auto")} · ${voiceBadge}`
        : voiceBadge;
    button.addEventListener("click", () => selectProject(project));
    els.projectList.append(button);
  }
}

function selectProject(project) {
  void cleanupDraftPreview();
  state.customVoiceDraft = null;
  state.selectedProject = project;
  const settings = project.settings ?? {};
  const effective = project.effective ?? {};
  const projectLocale = settings.voiceLocale ?? settings.customVoice?.locale ?? effective.voiceLocale;
  if (projectLocale && normalizeUiLocale(projectLocale, state.locale) !== state.locale) {
    setLocaleValue(projectLocale);
    applyStaticTranslations();
  }
  const projectTag =
    settings.projectTag ??
    effective.projectTag ??
    state.bootstrap.strategiesConfig.defaultProjectTag ??
    "default_reserved";
  const strategy = settings.strategy ?? effective.strategy ?? state.bootstrap.strategiesConfig.defaultStrategy;
  const strategyDefaults = strategyMap()[strategy] ?? {};
  const tagDefaults = projectTagMap()[projectTag] ?? {};
  state.customVoice = settings.customVoice ?? null;
  if (state.customVoice && settings.voiceLocale) {
    retargetCustomVoiceForCurrentLocale(state.customVoice);
  }

  els.selectedProjectName.textContent = project.name;
  els.selectedProjectPath.textContent = project.path;
  els.voiceStatus.textContent = effective.voiceEnabled ? t("enabled") : t("disabled");
  els.voiceStatus.className = `status-pill ${effective.voiceEnabled ? "enabled" : "disabled"}`;

  fillSelect(
    els.projectTagSelect,
    Object.entries(projectTagMap()).map(([key, value]) => ({
      label: `${localizeProjectTag(key, value).name} · ${key}`,
      value: key,
    })),
    projectTag,
  );
  renderProjectTagCards(projectTag);

  fillSelect(
    els.settingsFileSelect,
    state.bootstrap.settingsFiles.map((file) => ({ label: file, value: file })),
    project.settingsFile ?? "voice-project-settings.json",
  );

  fillSelect(
    els.strategySelect,
    Object.entries(strategyMap()).map(([key, value]) => ({
      label: `${value.displayName ?? key} · ${key}`,
      value: key,
    })),
    tagDefaults.strategy ?? strategy,
  );

  fillSelect(
    els.modeSelect,
    [
      { label: t("followVoiceMode"), value: "" },
      ...Object.entries(modeMap()).map(([key, value]) => ({
        label: `${localizeMode(key, value)} · ${key}`,
        value: key,
      })),
    ],
    tagDefaults.modeOverride ?? settings.modeOverride ?? "",
  );

  renderVoiceSelect(state.customVoice ? CUSTOM_VOICE_OPTION_VALUE : settings.voiceOverride ?? tagDefaults.voiceOverride ?? "");

  els.voiceIdentityLabel.value =
    state.customVoice?.label ||
    localizeProjectTag(projectTag, tagDefaults).identity ||
    tagDefaults.voiceIdentityLabel ||
    effective.voiceIdentityLabel ||
    settings.voiceIdentityLabel ||
    strategyDefaults.voiceIdentityLabel ||
    "";
  els.notesInput.value = localizeProjectTag(projectTag, tagDefaults).description || settings.notes || strategyDefaults.description || "";
  els.suppressAllSpeech.checked =
    Boolean(settings.suppressAllSpeech) ||
    Boolean(tagDefaults.suppressAllSpeech) ||
    strategy === "voice_disabled" ||
    settings.modeOverride === "voice_disabled";
  els.customVoicePrompt.value = state.customVoice?.prompt ?? "";
  els.customVoiceName.value = state.customVoice?.label ?? "";
  els.customVoiceSummary.textContent = customVoiceSummaryText();

  els.configForm.classList.remove("disabled");
  renderProjects();
  renderJsonPreview();
}

function applyProjectTagDefaults() {
  void cleanupDraftPreview();
  const tag = selectedProjectTag();
  const localized = localizeProjectTag(els.projectTagSelect.value, tag);
  state.customVoice = null;
  state.customVoiceDraft = null;
  els.customVoiceName.value = "";
  els.customVoicePrompt.value = "";
  els.customVoiceSummary.textContent = customVoiceSummaryText();
  els.strategySelect.value = tag.strategy ?? state.bootstrap.strategiesConfig.defaultStrategy ?? "reserved_partner_default";
  els.modeSelect.value = tag.modeOverride ?? "";
  renderVoiceSelect(tag.voiceOverride ?? "");
  els.voiceIdentityLabel.value = localized.identity || tag.voiceIdentityLabel || "";
  els.notesInput.value = localized.description || tag.description || "";
  els.suppressAllSpeech.checked = Boolean(tag.suppressAllSpeech) || tag.strategy === "voice_disabled" || tag.modeOverride === "voice_disabled";

  if (tag.strategy === "voice_disabled" || tag.modeOverride === "voice_disabled") {
    els.strategySelect.value = "voice_disabled";
    els.modeSelect.value = "voice_disabled";
    els.voiceSelect.value = "";
    els.suppressAllSpeech.checked = true;
  }

  renderJsonPreview();
  renderProjectTagCards(els.projectTagSelect.value);
}

async function loadBootstrap() {
  setMessage(t("readingConfig"));
  const response = await fetch("/api/bootstrap");
  if (!response.ok) {
    throw new Error(t("configServiceStatus", { status: response.status }));
  }

  state.bootstrap = await response.json();
  state.projects = state.bootstrap.projects ?? [];
  els.workspaceLabel.textContent = state.bootstrap.workspaceRoot;
  renderProjects();

  renderAutostartStatus(state.bootstrap.autostart);

  if (state.projects.length) {
    selectProject(state.projects[0]);
    setMessage(t("readProjects", { count: state.projects.length }), "success");
  } else {
    setMessage(t("noScannedProjects"));
  }
}

async function applySettings(event) {
  event?.preventDefault?.();
  if (!state.selectedProject) {
    setMessage(t("chooseProjectFirst"), "error");
    return;
  }
  if (event && state.customVoiceDraft) {
    await cleanupDraftPreview();
    clearCustomVoiceDraft();
  }

  els.applyButton.disabled = true;
  setMessage(t("writingConfig"));
  try {
    const response = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsPayload()),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? t("writeFailed", { status: response.status }));
    }

    const index = state.projects.findIndex((project) => project.path === result.project.path);
    if (index >= 0) {
      state.projects[index] = result.project;
    }
    selectProject(result.project);
    setMessage(t("wrotePath", { path: result.settingsPath }), "success");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    els.applyButton.disabled = false;
  }
}

async function applyAutomaticSettings() {
  if (!state.projects.length) {
    setMessage(t("noWritableProjects"), "error");
    return;
  }

  const overwrite = autoApplyOverwrite();
  els.autoAssignButton.disabled = true;
  setMessage(overwrite ? t("autoWritingOverwrite") : t("autoWritingMissing"));
  try {
    const response = await fetch("/api/apply-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settingsFile: "voice-project-settings.json",
        overwrite,
        voiceLocale: state.locale,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? t("autoWriteFailed", { status: response.status }));
    }

    state.projects = result.projects ?? state.projects;
    const currentPath = state.selectedProject?.path;
    const refreshedProject = state.projects.find((project) => project.path === currentPath) ?? state.projects[0];
    renderProjects();
    if (refreshedProject) {
      selectProject(refreshedProject);
    }
    setMessage(
      overwrite
        ? t("autoWroteAll", { written: result.written.length })
        : t("autoWroteMissing", { written: result.written.length, skipped: result.skipped.length }),
      "success",
    );
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    els.autoAssignButton.disabled = false;
  }
}

async function toggleConfigUiAutostart(event) {
  const enabled = event.currentTarget.checked;
  els.configUiAutostart.disabled = true;
  setMessage(enabled ? t("fixedOpening") : t("fixedClosing"));
  try {
    const response = await fetch("/api/autostart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? t("fixedFailed", { status: response.status }));
    }

    state.bootstrap.autostart = result.autostart;
    renderAutostartStatus(result.autostart);
    setMessage(enabled ? t("fixedOpened") : t("fixedClosed"), "success");
  } catch (error) {
    els.configUiAutostart.checked = !enabled;
    setMessage(error.message, "error");
  } finally {
    els.configUiAutostart.disabled = !state.bootstrap?.autostart?.supported;
  }
}

function clearCustomVoiceDraft({ clearInputs = false } = {}) {
  state.customVoiceDraft = null;
  state.customVoiceDraftAudioUrl = "";
  if (clearInputs) {
    els.customVoiceName.value = state.customVoice?.label ?? "";
    els.customVoicePrompt.value = state.customVoice?.prompt ?? "";
  }
  els.customVoiceSummary.textContent = customVoiceSummaryText(state.customVoice);
  if (!state.customVoice) {
    els.voicePreviewAudio.hidden = true;
    els.voicePreviewAudio.removeAttribute("src");
  }
}

async function cleanupDraftPreview({ beacon = false } = {}) {
  const audioUrl = state.customVoiceDraftAudioUrl;
  state.customVoiceDraftAudioUrl = "";
  if (!audioUrl) return;
  const payload = JSON.stringify({ audioUrl });
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/cleanup-preview", new Blob([payload], { type: "application/json" }));
    return;
  }
  try {
    await fetch("/api/cleanup-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Best-effort cleanup only; stale preview files can be overwritten later.
  }
}

async function previewSelectedVoice(customVoiceOverride = null) {
  const customVoice = customVoiceOverride ?? (isCustomVoiceSelected() ? state.customVoice : null);
  const voiceProfile = customVoice?.profileName ?? resolvedVoiceProfileName();
  if (!voiceProfile) {
    setMessage(t("noPreviewVoice"), "error");
    return false;
  }

  els.voicePreviewButton.disabled = true;
  els.voicePreviewButton.textContent = t("generating");
  setMessage(t("preparingPreview"));
  try {
    const response = await fetch("/api/preview-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voiceProfile,
        customVoice,
        locale: state.locale,
        text: customVoice?.previewText ?? previewSlogan(voiceProfile),
        preferGenerated: true,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? t("previewFailed", { status: response.status }));
    }

    els.voicePreviewAudio.hidden = false;
    els.voicePreviewAudio.src = `${result.audioUrl}?t=${Date.now()}`;
    if (customVoiceOverride) {
      await cleanupDraftPreview();
      state.customVoiceDraftAudioUrl = result.audioUrl;
    }
    try {
      await els.voicePreviewAudio.play();
      setMessage(t("playingGenerated"), "success");
    } catch {
      setMessage(t("previewReady"), "success");
    }
    return result;
  } catch (error) {
    setMessage(error.message, "error");
    return false;
  } finally {
    els.voicePreviewButton.textContent = t("preview");
    renderVoiceDetails();
  }
}

async function generateCustomVoice() {
  const name = els.customVoiceName.value.trim();
  const prompt = els.customVoicePrompt.value.trim();
  if (!name) {
    setMessage(t("customVoiceNameRequired"), "error");
    return;
  }
  if (!prompt) {
    setMessage(t("customVoicePromptRequired"), "error");
    return;
  }

  state.customVoiceDraft = generateCustomVoicePlan(prompt, name);
  els.customVoiceSummary.textContent = customVoiceSummaryText();
  renderJsonPreview();
  setMessage(t("customVoiceGenerating"));
  if (await previewSelectedVoice(state.customVoiceDraft)) {
    setMessage(t("customVoiceGenerated"), "success");
  }
}

async function saveCustomVoice() {
  if (!els.customVoiceName.value.trim()) {
    setMessage(t("customVoiceNameRequired"), "error");
    return;
  }
  if (!state.customVoiceDraft && !state.customVoice) {
    await generateCustomVoice();
    if (!state.customVoiceDraft) return;
  }
  if (state.customVoiceDraft) {
    state.customVoice = state.customVoiceDraft;
    state.customVoiceDraft = null;
    await cleanupDraftPreview();
  }
  applyCustomVoiceName();
  await applySettings();
}

async function clearCustomVoice() {
  await cleanupDraftPreview();
  state.customVoice = null;
  clearCustomVoiceDraft({ clearInputs: true });
  renderVoiceSelect(selectedProjectTag().voiceOverride ?? "");
  renderJsonPreview();
  setMessage(t("customVoiceCleared"), "success");
}

function applyCustomVoiceName() {
  const target = state.customVoiceDraft || state.customVoice;
  if (!target) return;
  const name = els.customVoiceName.value.trim();
  if (!name) return;
  target.label = name;
  target.style = customVoiceStyle(name, target.trait);
  if (target === state.customVoice) {
    els.voiceIdentityLabel.value = name;
    renderVoiceSelect(CUSTOM_VOICE_OPTION_VALUE);
  }
  els.customVoiceSummary.textContent = customVoiceSummaryText();
  renderJsonPreview();
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(els.jsonPreview.textContent);
    setMessage(t("jsonCopied"), "success");
  } catch {
    setMessage(t("copyFailed"), "error");
  }
}

els.refreshButton.addEventListener("click", () => loadBootstrap().catch((error) => setMessage(error.message, "error")));
els.languageSelect.addEventListener("change", (event) => setLocale(event.currentTarget.value));
els.autoAssignButton.addEventListener("click", applyAutomaticSettings);
els.configUiAutostart.addEventListener("change", toggleConfigUiAutostart);
els.projectSearch.addEventListener("input", renderProjects);
els.configForm.addEventListener("submit", applySettings);
els.copyJsonButton.addEventListener("click", copyJson);
els.voicePreviewButton.addEventListener("click", previewSelectedVoice);
els.generateCustomVoiceButton.addEventListener("click", generateCustomVoice);
els.saveCustomVoiceButton.addEventListener("click", saveCustomVoice);
els.clearCustomVoiceButton.addEventListener("click", clearCustomVoice);
els.projectTagSelect.addEventListener("change", applyProjectTagDefaults);
els.customVoiceName.addEventListener("input", applyCustomVoiceName);
els.voiceSelect.addEventListener("change", () => {
  if (els.voiceSelect.value && els.voiceSelect.value !== CUSTOM_VOICE_OPTION_VALUE && state.customVoice) {
    void cleanupDraftPreview();
    state.customVoice = null;
    state.customVoiceDraft = null;
    els.customVoiceName.value = "";
    els.customVoiceSummary.textContent = customVoiceSummaryText();
  }
  renderJsonPreview();
});
for (const control of [els.settingsFileSelect, els.modeSelect, els.voiceSelect, els.voiceIdentityLabel, els.notesInput, els.suppressAllSpeech]) {
  control.addEventListener("input", renderJsonPreview);
  control.addEventListener("change", renderJsonPreview);
}
window.addEventListener("beforeunload", () => {
  cleanupDraftPreview({ beacon: true });
});

setLocaleValue(state.locale);
applyStaticTranslations();

loadBootstrap().catch((error) => {
  setMessage(t("connectFailed", { message: error.message }), "error");
});
