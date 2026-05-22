param(
    [switch] $Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$venvPath = Join-Path $repoRoot ".venv"

if ($Force -and (Test-Path -LiteralPath $venvPath)) {
    Remove-Item -LiteralPath $venvPath -Recurse -Force
}

if (-not (Test-Path -LiteralPath $venvPath)) {
    $python = Get-Command python -ErrorAction SilentlyContinue

    if ($null -ne $python) {
        & $python.Source -m venv $venvPath
    }
    else {
        $py = Get-Command py -ErrorAction SilentlyContinue
        if ($null -eq $py) {
            throw "Python was not found. Install Python 3 and rerun this script."
        }
        & $py.Source -3 -m venv $venvPath
    }
}

$venvPython = Join-Path $venvPath "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "Virtual environment exists, but python.exe was not found at '$venvPython'."
}

& $venvPython -m pip install --upgrade pip edge-tts

Write-Output "Installed edge-tts in $venvPath"
