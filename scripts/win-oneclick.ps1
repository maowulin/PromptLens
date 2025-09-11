<#
PromptLens Windows One-Click Setup and Build Script
- Installs required tooling (Node.js LTS + pnpm, Rust, Tauri prerequisites) when missing
- Installs project dependencies
- Builds desktop bundle (Tauri installer)

Usage (PowerShell):
  - Right click this file > Run with PowerShell (recommended with Administrator)
  - Or from terminal: powershell -ExecutionPolicy Bypass -File ./scripts/win-oneclick.ps1

Optional flags:
  -SkipSystem       Skip installing system-level dependencies via winget
  -SkipFlutter      Skip checking/bootstrapping Flutter
  -BuildOnly        Do not install deps, only build
  -DesktopOnly      Only build desktop app (skip mobile)
#>

[CmdletBinding()]
param(
  [switch]$SkipSystem,
  [switch]$SkipFlutter,
  [switch]$BuildOnly,
  [switch]$DesktopOnly
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
Set-Location $repoRoot

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }
function Test-Cmd($name)  { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Ensure-Tooling() {
  if ($BuildOnly) { Write-Info "BuildOnly specified, skipping tooling installation"; return }

  if (-not $SkipSystem) {
    if (Test-Cmd 'winget') {
      Write-Info 'winget detected. Will install missing system prerequisites as needed.'
    } else {
      Write-Warn 'winget not found. System-level prerequisites will be skipped. Install Node.js LTS, Rust, VS Build Tools, and WebView2 manually if build fails.'
    }
  } else {
    Write-Info 'SkipSystem specified. Skipping system-level dependency installation.'
  }

  if (-not (Test-Cmd 'node')) {
    if (-not $SkipSystem -and (Test-Cmd 'winget')) {
      Write-Info 'Installing Node.js LTS via winget...'
      try { winget install -e --id OpenJS.NodeJS.LTS --silent | Out-Null; Write-Ok 'Node.js installed' } catch { Write-Warn "Failed to install Node.js via winget: $($_.Exception.Message)" }
    } else { Write-Warn 'Node.js not found. Please install Node.js LTS manually if subsequent steps fail.' }
  }
  if (-not (Test-Cmd 'pnpm')) {
    if (Test-Cmd 'npm') {
      Write-Info 'Installing pnpm globally via npm...'
      try { npm i -g pnpm | Out-Null; Write-Ok 'pnpm installed' } catch { Write-Warn "Failed to install pnpm globally: $($_.Exception.Message)" }
    } else {
      Write-Warn 'npm not found. Skipping pnpm installation.'
    }
  }

  if (-not (Test-Cmd 'cargo')) {
    if (-not $SkipSystem -and (Test-Cmd 'winget')) {
      Write-Info 'Installing Rust (rustup) via winget...'
      try { winget install -e --id Rustlang.Rustup --silent | Out-Null; Write-Ok 'Rustup installed' } catch { Write-Warn "Failed to install rustup via winget: $($_.Exception.Message)" }
    } else { Write-Warn 'Cargo not found. Please install Rust manually from https://rustup.rs if build fails.' }
  }
  if (Test-Cmd 'rustup') {
    Write-Info 'Ensuring stable toolchain and MSVC target...'
    try {
      rustup set profile minimal | Out-Null
      rustup default stable | Out-Null
      rustup target add x86_64-pc-windows-msvc | Out-Null
      Write-Ok 'Rust toolchain ready'
    } catch { Write-Warn "Failed configuring rustup: $($_.Exception.Message)" }
  }

  if (-not $SkipSystem -and (Test-Cmd 'winget')) {
    $hasCl = Test-Cmd 'cl'
    if (-not $hasCl) {
      Write-Info 'Installing Visual Studio 2022 Build Tools (C++ + Windows 10 SDK) via winget (this can take a while)...'
      try {
        winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--quiet --wait --norestart --nocache --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows10SDK.19041" | Out-Null
        Write-Ok 'VS Build Tools installation requested'
      } catch { Write-Warn "Failed to install VS Build Tools via winget: $($_.Exception.Message)" }
    } else {
      Write-Ok 'MSVC toolchain detected'
    }

    Write-Info 'Ensuring Microsoft Edge WebView2 Runtime is installed...'
    try { winget install -e --id Microsoft.EdgeWebView2Runtime --silent | Out-Null; Write-Ok 'WebView2 runtime installed/updated' } catch { Write-Warn "Failed to ensure WebView2 via winget: $($_.Exception.Message)" }
  }

  if (-not $SkipFlutter) {
    if (Test-Cmd 'flutter') {
      Write-Info 'Flutter detected, will bootstrap project deps later if needed.'
    } else {
      Write-Warn 'Flutter not found. Mobile build will be skipped.'
    }
  } else {
    Write-Info 'SkipFlutter specified. Skipping Flutter checks.'
  }
}

function Install-ProjectDeps() {
  if ($BuildOnly) { Write-Info 'BuildOnly specified, skipping dependency installation'; return }

  Write-Info 'Installing Rust workspace dependencies (cargo build to warm cache)...'
  try { cargo build --workspace | Out-Null; Write-Ok 'Rust workspace build (debug) complete' } catch { Write-Err "Cargo build failed: $($_.Exception.Message)"; throw }

  Write-Info 'Installing web-client dependencies (pnpm)...'
  try { pnpm -C apps/web-client install | Out-Null; Write-Ok 'web-client deps installed' } catch { Write-Err "pnpm install for web-client failed: $($_.Exception.Message)"; throw }

  Write-Info 'Installing desktop (tauri-app) dependencies (pnpm)...'
  try { pnpm -C apps/desktop/tauri-app install | Out-Null; Write-Ok 'tauri-app deps installed' } catch { Write-Err "pnpm install for tauri-app failed: $($_.Exception.Message)"; throw }

  if (-not $SkipFlutter -and (Test-Cmd 'flutter')) {
    Write-Info 'Bootstrapping Flutter app dependencies (flutter pub get)...'
    try { Push-Location apps/mobile/flutter-app; flutter pub get | Out-Null; Pop-Location; Write-Ok 'Flutter deps installed' } catch { Write-Warn "Flutter bootstrap failed: $($_.Exception.Message)" }
  }
}

function Ensure-DesktopIcons() {
  $iconsDir = Join-Path $repoRoot 'apps/desktop/tauri-app/src-tauri/icons'
  $icoPath = Join-Path $iconsDir 'icon.ico'
  $pngPath = Join-Path $iconsDir 'icon.png'
  if (Test-Path $icoPath) { Write-Info 'icons/icon.ico exists'; return }
  if (Test-Path $pngPath) {
    Write-Info 'Generating Windows icon (.ico) from icon.png...'
    pnpm -C apps/desktop/tauri-app tauri icon src-tauri/icons/icon.png | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "tauri icon generation failed with code $LASTEXITCODE" }
    Write-Ok 'Generated platform icons'
  } else {
    Write-Warn 'icons/icon.png not found; Windows build may fail. Add an icon at apps/desktop/tauri-app/src-tauri/icons/icon.png'
  }
}

function Build-Desktop() {
  Write-Info 'Building web-client (desktop target)...'
  pnpm -C apps/web-client build:desktop | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "web-client build failed with code $LASTEXITCODE" }
  Write-Ok 'web-client built for desktop'

  Write-Info 'Ensuring desktop icons...'
  Ensure-DesktopIcons

  Write-Info 'Building Tauri desktop bundle (installer)...'
  pnpm -C apps/desktop/tauri-app tauri build | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Tauri build failed with code $LASTEXITCODE" }
  Write-Ok 'Tauri desktop bundle created'

  $bundleDir1 = Join-Path $repoRoot 'apps/desktop/tauri-app/src-tauri/target/release/bundle'
  $bundleDir2 = Join-Path $repoRoot 'target/release/bundle'
  $exePath    = Join-Path $repoRoot 'target/release/promptlens-tauri.exe'

  $found = $false
  Write-Info "Check bundle artifacts..."
  foreach ($dir in @($bundleDir1, $bundleDir2)) {
    Write-Info "Bundle dir: $dir"
    if (Test-Path $dir) {
      $found = $true
      Get-ChildItem -Path $dir -Recurse -File | ForEach-Object { Write-Host "  - $($_.FullName)" }
    } else {
      Write-Host '  not found'
    }
  }

  Write-Info "Executable: $exePath"
  if (Test-Path $exePath) {
    $found = $true
    Get-Item $exePath | Select-Object FullName, Length | ForEach-Object { Write-Host "  - $($_.FullName) [$($_.Length) bytes]" }
  } else {
    Write-Host '  not found'
  }

  if (-not $found) {
    Write-Warn 'No bundle or executable found. Build may have failed earlier.'
  }
}

function Build-MobileOptional() {
  if ($DesktopOnly) { Write-Info 'DesktopOnly specified, skipping mobile build.'; return }
  if ($SkipFlutter -or -not (Test-Cmd 'flutter')) { Write-Info 'Flutter not available. Skipping mobile build.'; return }
  Write-Info 'Building Flutter mobile app (Android release)...'
  try { Push-Location apps/mobile/flutter-app; flutter build apk --release; Pop-Location; Write-Ok 'Flutter APK build completed' } catch { Write-Warn "Flutter build failed: $($_.Exception.Message)" }
}

try {
  Write-Host "🚀 PromptLens Windows One-Click Start" -ForegroundColor Magenta
  Write-Info "Repository root: $repoRoot"
  Ensure-Tooling
  Install-ProjectDeps
  Build-Desktop
  Build-MobileOptional
  Write-Ok 'All done!'
  Write-Host 'Tip: You can re-run only the build phase with: powershell -ExecutionPolicy Bypass -File .\scripts\win-oneclick.ps1 -BuildOnly' -ForegroundColor DarkGray
} catch {
  Write-Err "Failed: $($_.Exception.Message)"
  exit 1
}