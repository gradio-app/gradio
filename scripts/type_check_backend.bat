@echo off
setlocal

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source helpers
call scripts\helpers.bat

:: Check pip requirement
call :pip_required

echo Adding py.typed file to gradio.
type nul > gradio\py.typed

:: Run pyright
python -m pyright
