param(
    [Parameter(Position = 0, ValueFromPipeline = $true)]
    [string[]] $Text,

    [ValidateSet("soft_loli_character", "02-anime-soft-loli-character", "A1-relaxed-female-explainer", "A3-v2-gentle-companion-lighter", "A3-v3", "A5-casual-female-voiceover", "01-anime-genki-heroine", "03-anime-sweet-idol", "04-anime-cool-senior-sister", "05-anime-warm-senior-sister", "06-anime-youth-qingyin", "07-anime-clean-young-male", "project-voice-lab-cute", "project-coding-professional", "project-product-warm", "project-learning-narrator", "warm", "lively", "sunshine", "professional", "passion", "bright", "podcast", "detective", "narrator")]
    [string] $Profile = "soft_loli_character",

    [string] $Voice,

    [string] $Rate,

    [string] $Pitch,

    [string] $Volume = "+0%",

    [string] $OutPath,

    [switch] $NoPlay,

    [switch] $ListVoices,

    [int] $PlaybackLockTimeoutSeconds = 300,

    [string] $ProjectRoot,

    [switch] $IgnoreProjectVoiceSettings
)

function Get-VoiceProjectSettings {
    param([string] $StartPath)

    if ([string]::IsNullOrWhiteSpace($StartPath)) {
        $StartPath = (Get-Location).ProviderPath
    }

    try {
        $currentItem = Get-Item -LiteralPath $StartPath -ErrorAction Stop
    }
    catch {
        return $null
    }

    $directory = if ($currentItem.PSIsContainer) {
        $currentItem.FullName
    }
    else {
        Split-Path -Parent $currentItem.FullName
    }

    while (-not [string]::IsNullOrWhiteSpace($directory)) {
        foreach ($fileName in @("voice-project-settings.json", ".codex-voice.json")) {
            $settingsPath = Join-Path $directory $fileName
            if (Test-Path -LiteralPath $settingsPath) {
                try {
                    $settings = Get-Content -Raw -Encoding UTF8 -LiteralPath $settingsPath | ConvertFrom-Json
                    return $settings
                }
                catch {
                    Write-Warning "Could not parse voice settings at '$settingsPath'; continuing without suppression."
                }
            }
        }

        $parent = Split-Path -Parent $directory
        if ($parent -eq $directory) {
            break
        }

        $directory = $parent
    }

    return $null
}

function Test-VoiceSuppressedBySettings {
    param($Settings)

    return (
        $null -ne $Settings -and (
            $Settings.suppressAllSpeech -eq $true -or
            $Settings.strategy -eq "voice_disabled" -or
            $Settings.modeOverride -eq "voice_disabled" -or
            $Settings.projectTag -eq "silent_project"
        )
    )
}

function Get-CustomVoiceFromSettings {
    param($Settings)

    if ($null -eq $Settings -or $null -eq $Settings.customVoice) {
        return $null
    }

    $custom = $Settings.customVoice
    if ([string]::IsNullOrWhiteSpace([string] $custom.voice)) {
        return $null
    }

    return @{
        Voice = [string] $custom.voice
        Rate = if ([string]::IsNullOrWhiteSpace([string] $custom.rate)) { "+0%" } else { [string] $custom.rate }
        Pitch = if ([string]::IsNullOrWhiteSpace([string] $custom.pitch)) { "+0Hz" } else { [string] $custom.pitch }
    }
}

function Normalize-VoiceLocale {
    param([string] $Locale)

    if ([string]::IsNullOrWhiteSpace($Locale)) {
        return $null
    }

    $trimmed = $Locale.Trim()
    if ($trimmed.StartsWith("zh", [System.StringComparison]::OrdinalIgnoreCase)) {
        return "zh-CN"
    }

    $base = $trimmed.Split("-", 2)[0].ToLowerInvariant()
    if (@("en", "fr", "ja", "ko") -contains $base) {
        return $base
    }

    return $null
}

function Get-VoiceLocaleFromSettings {
    param($Settings)

    if ($null -eq $Settings) {
        return $null
    }

    if ($null -ne $Settings.customVoice -and -not [string]::IsNullOrWhiteSpace([string] $Settings.customVoice.locale)) {
        return Normalize-VoiceLocale -Locale ([string] $Settings.customVoice.locale)
    }

    if (-not [string]::IsNullOrWhiteSpace([string] $Settings.voiceLocale)) {
        return Normalize-VoiceLocale -Locale ([string] $Settings.voiceLocale)
    }

    if (-not [string]::IsNullOrWhiteSpace([string] $Settings.locale)) {
        return Normalize-VoiceLocale -Locale ([string] $Settings.locale)
    }

    return $null
}

function Resolve-LocalizedVoiceName {
    param(
        [string] $Voice,
        [string] $Locale
    )

    switch (Normalize-VoiceLocale -Locale $Locale) {
        "en" { return "en-US-JennyNeural" }
        "fr" { return "fr-FR-DeniseNeural" }
        "ja" { return "ja-JP-NanamiNeural" }
        "ko" { return "ko-KR-SunHiNeural" }
        default { return $Voice }
    }
}

function Resolve-StrategyVoiceProfile {
    param([string] $StrategyName)

    if ([string]::IsNullOrWhiteSpace($StrategyName)) {
        return $null
    }

    $strategyRoot = if ((Split-Path -Leaf $PSScriptRoot) -eq "scripts") {
        Split-Path -Parent $PSScriptRoot
    }
    else {
        $PSScriptRoot
    }
    $strategyPath = Join-Path $strategyRoot "project-voice-strategies.json"
    if (Test-Path -LiteralPath $strategyPath) {
        try {
            $strategyConfig = Get-Content -Raw -Encoding UTF8 -LiteralPath $strategyPath | ConvertFrom-Json
            $strategy = $strategyConfig.strategies.$StrategyName
            if ($null -ne $strategy -and -not [string]::IsNullOrWhiteSpace($strategy.voiceProfile)) {
                return [string] $strategy.voiceProfile
            }
        }
        catch {
            Write-Warning "Could not parse project voice strategies at '$strategyPath'."
        }
    }

    $fallbackProfiles = @{
        voice_lab = "project-voice-lab-cute"
        coding_focus = "project-coding-professional"
        product_design = "project-product-warm"
        learning_mode = "project-learning-narrator"
        reserved_partner_default = "02-anime-soft-loli-character"
    }

    if ($fallbackProfiles.ContainsKey($StrategyName)) {
        return $fallbackProfiles[$StrategyName]
    }

    return $null
}

function Resolve-ProjectTagVoiceProfile {
    param([string] $ProjectTag)

    if ([string]::IsNullOrWhiteSpace($ProjectTag)) {
        return $null
    }

    $strategyRoot = if ((Split-Path -Leaf $PSScriptRoot) -eq "scripts") {
        Split-Path -Parent $PSScriptRoot
    }
    else {
        $PSScriptRoot
    }
    $strategyPath = Join-Path $strategyRoot "project-voice-strategies.json"
    if (Test-Path -LiteralPath $strategyPath) {
        try {
            $strategyConfig = Get-Content -Raw -Encoding UTF8 -LiteralPath $strategyPath | ConvertFrom-Json
            $tag = $strategyConfig.projectTags.$ProjectTag
            if ($null -ne $tag) {
                if (-not [string]::IsNullOrWhiteSpace($tag.voiceOverride)) {
                    return [string] $tag.voiceOverride
                }

                if (-not [string]::IsNullOrWhiteSpace($tag.strategy)) {
                    return Resolve-StrategyVoiceProfile -StrategyName ([string] $tag.strategy)
                }
            }
        }
        catch {
            Write-Warning "Could not parse project voice tags at '$strategyPath'."
        }
    }

    $fallbackProfiles = @{
        default_reserved = "02-anime-soft-loli-character"
        voice_lab_cute = "project-voice-lab-cute"
        coding_quiet = "project-coding-professional"
        product_warm = "project-product-warm"
        learning_narrator = "project-learning-narrator"
    }

    if ($fallbackProfiles.ContainsKey($ProjectTag)) {
        return $fallbackProfiles[$ProjectTag]
    }

    return $null
}

$projectSettings = if ($IgnoreProjectVoiceSettings) { $null } else { Get-VoiceProjectSettings -StartPath $ProjectRoot }
$projectVoiceLocale = if ($IgnoreProjectVoiceSettings) { $null } else { Get-VoiceLocaleFromSettings -Settings $projectSettings }

if (-not $IgnoreProjectVoiceSettings -and (Test-VoiceSuppressedBySettings -Settings $projectSettings)) {
    exit 0
}

$repoRoot = if ((Split-Path -Leaf $PSScriptRoot) -eq "scripts") {
    Split-Path -Parent $PSScriptRoot
}
else {
    $PSScriptRoot
}

$edgeTtsCandidates = @(
    (Join-Path $repoRoot (Join-Path ".venv" (Join-Path "Scripts" "edge-tts.exe"))),
    (Join-Path $repoRoot (Join-Path ".venv" (Join-Path "bin" "edge-tts")))
)

$edgeTts = $null
foreach ($candidate in $edgeTtsCandidates) {
    if (Test-Path -LiteralPath $candidate) {
        $edgeTts = $candidate
        break
    }
}

if ($null -eq $edgeTts) {
    $edgeTtsCommand = Get-Command "edge-tts" -ErrorAction SilentlyContinue
    if ($null -ne $edgeTtsCommand) {
        $edgeTts = $edgeTtsCommand.Source
    }
}

if ($null -eq $edgeTts) {
    Write-Error "edge-tts is not installed in .venv or on PATH."
    exit 1
}

if ($ListVoices) {
    & $edgeTts --list-voices | Select-String -Pattern "zh-CN"
    exit $LASTEXITCODE
}

$chunks = New-Object System.Collections.Generic.List[string]

foreach ($item in $Text) {
    if (-not [string]::IsNullOrWhiteSpace($item)) {
        $chunks.Add($item)
    }
}

foreach ($item in $input) {
    if ($null -ne $item -and -not [string]::IsNullOrWhiteSpace([string] $item)) {
        $chunks.Add([string] $item)
    }
}

$message = ($chunks -join " ").Trim()
if ([string]::IsNullOrWhiteSpace($message)) {
    exit 0
}

function Invoke-WithVoicePlaybackLock {
    param(
        [scriptblock] $Action,
        [int] $TimeoutSeconds = 300
    )

    $lockPath = Join-Path ([System.IO.Path]::GetTempPath()) "codex-voice-playback.lock"
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $stream = $null

    while ($null -eq $stream -and (Get-Date) -lt $deadline) {
        try {
            $stream = [System.IO.File]::Open(
                $lockPath,
                [System.IO.FileMode]::OpenOrCreate,
                [System.IO.FileAccess]::ReadWrite,
                [System.IO.FileShare]::None
            )
        }
        catch {
            Start-Sleep -Milliseconds 200
        }
    }

    if ($null -eq $stream) {
        Write-Warning "Could not acquire Codex voice playback lock within $TimeoutSeconds seconds; skipping playback."
        return
    }

    try {
        & $Action
    }
    finally {
        $stream.Dispose()
    }
}

function Invoke-AudioPlayback {
    param([string] $MediaPath)

    try {
        Add-Type -AssemblyName PresentationCore -ErrorAction Stop
        $player = New-Object System.Windows.Media.MediaPlayer
        $player.Open([Uri] $MediaPath)

        for ($i = 0; $i -lt 20 -and -not $player.NaturalDuration.HasTimeSpan; $i++) {
            Start-Sleep -Milliseconds 100
        }

        $player.Play()

        if ($player.NaturalDuration.HasTimeSpan) {
            $sleepMs = [Math]::Ceiling($player.NaturalDuration.TimeSpan.TotalMilliseconds) + 500
            Start-Sleep -Milliseconds $sleepMs
        }
        else {
            Start-Sleep -Seconds 8
        }

        $player.Close()
        return
    }
    catch {
        # Fall through to command-line players for macOS/Linux or Windows fallback.
    }

    $afplay = Get-Command "afplay" -ErrorAction SilentlyContinue
    if ($null -ne $afplay) {
        & $afplay.Source $MediaPath
        return
    }

    $ffplay = Get-Command "ffplay" -ErrorAction SilentlyContinue
    if ($null -ne $ffplay) {
        & $ffplay.Source -nodisp -autoexit -loglevel quiet $MediaPath
        return
    }

    $mpg123 = Get-Command "mpg123" -ErrorAction SilentlyContinue
    if ($null -ne $mpg123) {
        & $mpg123.Source -q $MediaPath
        return
    }

    $mpv = Get-Command "mpv" -ErrorAction SilentlyContinue
    if ($null -ne $mpv) {
        & $mpv.Source --really-quiet --no-video $MediaPath
        return
    }

    try {
        Start-Process -FilePath $MediaPath | Out-Null
        Start-Sleep -Seconds 8
    }
    catch {
        Write-Warning "Generated audio but could not play it automatically: $MediaPath"
    }
}

$profiles = @{
    soft_loli_character = @{
        Voice = "zh-CN-XiaoyiNeural"
        Rate = "+5%"
        Pitch = "+5Hz"
    }
    "02-anime-soft-loli-character" = @{
        Voice = "zh-CN-XiaoyiNeural"
        Rate = "+5%"
        Pitch = "+5Hz"
    }
    "A1-relaxed-female-explainer" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "-5%"
        Pitch = "-1Hz"
    }
    "A3-v2-gentle-companion-lighter" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+5%"
        Pitch = "+0Hz"
    }
    "A3-v3" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+7%"
        Pitch = "-1Hz"
    }
    "A5-casual-female-voiceover" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+3%"
        Pitch = "+1Hz"
    }
    "01-anime-genki-heroine" = @{
        Voice = "zh-CN-XiaoyiNeural"
        Rate = "+8%"
        Pitch = "+3Hz"
    }
    "03-anime-sweet-idol" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+6%"
        Pitch = "+2Hz"
    }
    "04-anime-cool-senior-sister" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "-3%"
        Pitch = "-3Hz"
    }
    "05-anime-warm-senior-sister" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "-1%"
        Pitch = "-2Hz"
    }
    "06-anime-youth-qingyin" = @{
        Voice = "zh-CN-YunxiNeural"
        Rate = "+5%"
        Pitch = "+2Hz"
    }
    "07-anime-clean-young-male" = @{
        Voice = "zh-CN-YunxiNeural"
        Rate = "+1%"
        Pitch = "+0Hz"
    }
    "project-voice-lab-cute" = @{
        Voice = "zh-CN-XiaoyiNeural"
        Rate = "+5%"
        Pitch = "+5Hz"
    }
    "project-coding-professional" = @{
        Voice = "zh-CN-YunyangNeural"
        Rate = "-2%"
        Pitch = "-1Hz"
    }
    "project-product-warm" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+0%"
        Pitch = "+0Hz"
    }
    "project-learning-narrator" = @{
        Voice = "zh-CN-YunxiNeural"
        Rate = "-6%"
        Pitch = "-2Hz"
    }
    warm = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+0%"
        Pitch = "+0Hz"
    }
    lively = @{
        Voice = "zh-CN-XiaoyiNeural"
        Rate = "+6%"
        Pitch = "+2Hz"
    }
    sunshine = @{
        Voice = "zh-CN-YunxiNeural"
        Rate = "+3%"
        Pitch = "+0Hz"
    }
    professional = @{
        Voice = "zh-CN-YunyangNeural"
        Rate = "-2%"
        Pitch = "-1Hz"
    }
    passion = @{
        Voice = "zh-CN-YunjianNeural"
        Rate = "+4%"
        Pitch = "+0Hz"
    }
    bright = @{
        Voice = "zh-CN-shaanxi-XiaoniNeural"
        Rate = "+5%"
        Pitch = "+2Hz"
    }
    podcast = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "-5%"
        Pitch = "-2Hz"
    }
    detective = @{
        Voice = "zh-CN-YunyangNeural"
        Rate = "-7%"
        Pitch = "-3Hz"
    }
    narrator = @{
        Voice = "zh-CN-YunxiNeural"
        Rate = "-6%"
        Pitch = "-2Hz"
    }
}

$profileWasExplicit = $PSBoundParameters.ContainsKey("Profile")
$customVoiceSettings = if (-not $profileWasExplicit -and $null -ne $projectSettings) { Get-CustomVoiceFromSettings -Settings $projectSettings } else { $null }
if (-not $profileWasExplicit -and $null -ne $projectSettings -and $null -eq $customVoiceSettings) {
    if (-not [string]::IsNullOrWhiteSpace($projectSettings.voiceOverride)) {
        $Profile = [string] $projectSettings.voiceOverride
    }
    elseif (-not [string]::IsNullOrWhiteSpace($projectSettings.projectTag)) {
        $resolvedVoiceProfile = Resolve-ProjectTagVoiceProfile -ProjectTag ([string] $projectSettings.projectTag)
        if (-not [string]::IsNullOrWhiteSpace($resolvedVoiceProfile)) {
            $Profile = $resolvedVoiceProfile
        }
    }
    else {
        $resolvedVoiceProfile = Resolve-StrategyVoiceProfile -StrategyName ([string] $projectSettings.strategy)
        if (-not [string]::IsNullOrWhiteSpace($resolvedVoiceProfile)) {
            $Profile = $resolvedVoiceProfile
        }
    }
}

if ($null -eq $customVoiceSettings -and -not $profiles.ContainsKey($Profile)) {
    Write-Error "Unknown voice profile '$Profile'."
    exit 2
}

$selected = if ($null -ne $customVoiceSettings) { $customVoiceSettings } else { $profiles[$Profile] }
$voiceName = if ([string]::IsNullOrWhiteSpace($Voice)) {
    if ($null -ne $customVoiceSettings) { $selected.Voice } else { Resolve-LocalizedVoiceName -Voice $selected.Voice -Locale $projectVoiceLocale }
} else { $Voice }
$rateValue = if ([string]::IsNullOrWhiteSpace($Rate)) { $selected.Rate } else { $Rate }
$pitchValue = if ([string]::IsNullOrWhiteSpace($Pitch)) { $selected.Pitch } else { $Pitch }

if ([string]::IsNullOrWhiteSpace($OutPath)) {
    $fileName = "codex-voice-{0:yyyyMMdd-HHmmssfff}-{1}.mp3" -f (Get-Date), $PID
    $OutPath = Join-Path (Join-Path $repoRoot "out") $fileName
}

$resolvedOutPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutPath)
$parent = Split-Path -Parent $resolvedOutPath

if (-not [string]::IsNullOrWhiteSpace($parent) -and -not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent | Out-Null
}

& $edgeTts `
    --text $message `
    --voice $voiceName `
    "--rate=$rateValue" `
    "--pitch=$pitchValue" `
    "--volume=$Volume" `
    --write-media $resolvedOutPath

if ($LASTEXITCODE -ne 0) {
    Write-Error "edge-tts failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}

Write-Output $resolvedOutPath

if (-not $NoPlay) {
    Invoke-WithVoicePlaybackLock -TimeoutSeconds $PlaybackLockTimeoutSeconds -Action {
        Invoke-AudioPlayback -MediaPath $resolvedOutPath
    }
}
