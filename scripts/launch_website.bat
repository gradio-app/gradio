@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source the helpers script
call scripts\helpers.bat

:: Check for pnpm
call :pnpm_required

echo Building the website...
cd js/_website
pnpm dev