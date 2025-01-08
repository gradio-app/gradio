@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source the helpers script
call scripts\helpers.bat

:: Check for pnpm
call :pnpm_required

:: Generate theme using Python script
python scripts\generate_theme.py

echo Building the frontend...
pnpm i --frozen-lockfile --ignore-scripts
pnpm build