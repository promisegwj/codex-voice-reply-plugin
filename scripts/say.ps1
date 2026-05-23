param(
    [Parameter(Position = 0, ValueFromPipeline = $true)]
    [string[]] $Text,

    [string] $Voice,

    [string] $Device,

    [string] $WavPath,

    [switch] $Open,

    [ValidateRange(-10, 10)]
    [int] $Rate = 0,

    [ValidateRange(0, 100)]
    [int] $Volume = 100,

    [switch] $Async,

    [int] $PlaybackLockTimeoutSeconds = 300,

    [string] $ProjectRoot,

    [switch] $IgnoreProjectVoiceSettings
)

function Test-VoiceSuppressedByProjectSettings {
    param([string] $StartPath)

    if ([string]::IsNullOrWhiteSpace($StartPath)) {
        $StartPath = (Get-Location).ProviderPath
    }

    try {
        $currentItem = Get-Item -LiteralPath $StartPath -ErrorAction Stop
    }
    catch {
        return $false
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
                    if (
                        $settings.suppressAllSpeech -eq $true -or
                        $settings.strategy -eq "voice_disabled" -or
                        $settings.modeOverride -eq "voice_disabled"
                    ) {
                        return $true
                    }
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

    return $false
}

if (-not $IgnoreProjectVoiceSettings -and (Test-VoiceSuppressedByProjectSettings -StartPath $ProjectRoot)) {
    exit 0
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

try {
    $speaker = New-Object -ComObject SAPI.SpVoice

    if (-not [string]::IsNullOrWhiteSpace($Voice)) {
        $voiceToken = $speaker.GetVoices() | Where-Object {
            $_.GetDescription() -like "*$Voice*"
        } | Select-Object -First 1

        if ($null -eq $voiceToken) {
            throw "No installed voice matched '$Voice'."
        }

        $speaker.Voice = $voiceToken
    }

    if (-not [string]::IsNullOrWhiteSpace($Device)) {
        $deviceToken = $speaker.GetAudioOutputs() | Where-Object {
            $_.GetDescription() -like "*$Device*"
        } | Select-Object -First 1

        if ($null -eq $deviceToken) {
            throw "No audio output device matched '$Device'."
        }

        $speaker.AudioOutput = $deviceToken
    }

    $speaker.Rate = $Rate
    $speaker.Volume = $Volume

    if (-not [string]::IsNullOrWhiteSpace($WavPath)) {
        $resolvedWavPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($WavPath)
        $parent = Split-Path -Parent $resolvedWavPath

        if (-not [string]::IsNullOrWhiteSpace($parent) -and -not (Test-Path -LiteralPath $parent)) {
            New-Item -ItemType Directory -Path $parent | Out-Null
        }

        $stream = New-Object -ComObject SAPI.SpFileStream

        try {
            # 3 = create for write.
            $stream.Open($resolvedWavPath, 3)
            $speaker.AudioOutputStream = $stream
            [void] $speaker.Speak($message)
        }
        finally {
            $stream.Close()
        }

        Write-Output $resolvedWavPath

        if ($Open) {
            Start-Process -FilePath $resolvedWavPath | Out-Null
        }

        exit 0
    }

    Invoke-WithVoicePlaybackLock -TimeoutSeconds $PlaybackLockTimeoutSeconds -Action {
        if ($Async) {
            # 1 = asynchronous speech flag for SAPI; wait here so the playback lock remains meaningful.
            [void] $speaker.Speak($message, 1)
            [void] $speaker.WaitUntilDone(-1)
        }
        else {
            [void] $speaker.Speak($message)
        }
    }
}
catch {
    Write-Error "Unable to speak text with Windows SAPI: $($_.Exception.Message)"
    exit 1
}
