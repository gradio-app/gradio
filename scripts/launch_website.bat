@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pnpm
call scripts\helpers.bat pnpm_required

echo Building the website...
cd js/_website
pnpm dev