@echo off
setlocal

:: Change to parent directory of script location
cd /d "%~dp0.."

echo Adding py.typed file to gradio.
type nul > gradio\py.typed

ty check
