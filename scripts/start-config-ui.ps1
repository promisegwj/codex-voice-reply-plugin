param(
    [int] $Port = 47321,
    [string] $WorkspaceRoot,
    [switch] $Open,
    [switch] $AllowOutsideWorkspace
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $PSScriptRoot "start-config-ui.py"
$url = "http://127.0.0.1:$Port/"

if ([string]::IsNullOrWhiteSpace($WorkspaceRoot)) {
    $WorkspaceRoot = Split-Path -Parent $repoRoot
}

try {
    Invoke-RestMethod -Uri "$($url)api/bootstrap" -Method Get -TimeoutSec 2 | Out-Null
    Write-Output "Codex Voice Reply config UI is already running: $url"
    if ($Open) {
        Start-Process $url | Out-Null
    }
    exit 0
}
catch {
    # No server is listening on the stable port yet; start a new one below.
}

$arguments = @(
    $serverScript,
    "--port",
    [string] $Port,
    "--workspace-root",
    $WorkspaceRoot
)

if ($Open) {
    $arguments += "--open"
}

if ($AllowOutsideWorkspace) {
    $arguments += "--allow-outside-workspace"
}

$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (Test-Path -LiteralPath $venvPython) {
    & $venvPython @arguments
    exit $LASTEXITCODE
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -ne $python) {
    & $python.Source @arguments
    exit $LASTEXITCODE
}

$py = Get-Command py -ErrorAction SilentlyContinue
if ($null -ne $py) {
    & $py.Source -3 @arguments
    exit $LASTEXITCODE
}

throw "Python was not found. Install Python 3, or run scripts\bootstrap.ps1 first."
