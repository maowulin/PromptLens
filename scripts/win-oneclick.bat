@echo off
setlocal EnableDelayedExpansion
REM PromptLens Windows One-Click wrapper (Batch)
REM This wraps PowerShell script to make double-click usage easy.

set SCRIPT_DIR=%~dp0
set PS1=%SCRIPT_DIR%win-oneclick.ps1

if not exist "%PS1%" (
  echo [ERR ] Cannot find PowerShell script: %PS1%
  exit /b 1
)

REM Forward all arguments to the PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*
set EXITCODE=%ERRORLEVEL%

if %EXITCODE% NEQ 0 (
  echo [ERR ] Script failed with exit code %EXITCODE%
) else (
  echo [ OK ] Completed successfully.
)

exit /b %EXITCODE%