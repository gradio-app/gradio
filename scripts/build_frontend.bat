@echo off
setlocal EnableDelayedExpansion

set "DOWNLOAD_OFFLINE_ASSETS=true"

:parse_args
if "%~1"=="" goto args_parsed
if /I "%~1"=="--no-download-offline-assets" (
    set "DOWNLOAD_OFFLINE_ASSETS=false"
    shift
    goto parse_args
)
echo Unknown argument: %~1
exit /b 1

:args_parsed

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pnpm
call scripts\helpers.bat pnpm_required

:: Generate theme using Python script
python scripts\generate_theme.py

echo Building the frontend...
pnpm i --frozen-lockfile --ignore-scripts
pnpm build

if /I "%DOWNLOAD_OFFLINE_ASSETS%"=="true" (
    python scripts\download_offline_assets.py
)
