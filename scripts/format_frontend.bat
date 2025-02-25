@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pnpm
call scripts\helpers.bat pnpm_required

echo Formatting the frontend... Also we'll do type checking with TypeScript.
pnpm i
pnpm format:write
pnpm ts:check