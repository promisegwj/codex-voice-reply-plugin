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

    [switch] $Async
)

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

    if ($Async) {
        [void] $speaker.Speak($message, 1)
    }
    else {
        [void] $speaker.Speak($message)
    }
}
catch {
    Write-Error "Unable to speak text with Windows SAPI: $($_.Exception.Message)"
    exit 1
}
