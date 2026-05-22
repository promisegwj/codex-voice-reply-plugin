param(
    [Parameter(Position = 0, ValueFromPipeline = $true)]
    [string[]] $Text,

    [ValidateSet("voice-reply", "warm", "lively", "sunshine", "professional", "passion", "bright", "podcast", "detective", "narrator")]
    [string] $Profile = "voice-reply",

    [string] $Voice,

    [string] $Rate,

    [string] $Pitch,

    [string] $Volume = "+0%",

    [string] $OutPath,

    [switch] $NoPlay,

    [switch] $ListVoices
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$edgeTts = Join-Path $repoRoot ".venv\Scripts\edge-tts.exe"

if (-not (Test-Path -LiteralPath $edgeTts)) {
    Write-Error "edge-tts is not installed at '$edgeTts'. Run scripts\bootstrap.ps1 first."
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

$profiles = @{
    "voice-reply" = @{
        Voice = "zh-CN-XiaoxiaoNeural"
        Rate = "+7%"
        Pitch = "-1Hz"
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

$selected = $profiles[$Profile]
$voiceName = if ([string]::IsNullOrWhiteSpace($Voice)) { $selected.Voice } else { $Voice }
$rateValue = if ([string]::IsNullOrWhiteSpace($Rate)) { $selected.Rate } else { $Rate }
$pitchValue = if ([string]::IsNullOrWhiteSpace($Pitch)) { $selected.Pitch } else { $Pitch }

if ([string]::IsNullOrWhiteSpace($OutPath)) {
    $fileName = "codex-voice-{0:yyyyMMdd-HHmmss}.mp3" -f (Get-Date)
    $OutPath = Join-Path $repoRoot "out\$fileName"
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
    try {
        Add-Type -AssemblyName PresentationCore
        $player = New-Object System.Windows.Media.MediaPlayer
        $player.Open([Uri] $resolvedOutPath)

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
    }
    catch {
        Start-Process -FilePath $resolvedOutPath | Out-Null
    }
}
