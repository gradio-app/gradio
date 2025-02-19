@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pnpm
call scripts\helpers.bat pnpm_required

:: Generate theme using Python script
python scripts\generate_theme.py

echo Building the frontend...
pnpm i --frozen-lockfile --ignore-scripts
pnpm build