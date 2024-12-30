@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source the helpers script
call scripts\helpers.bat

:: Check for pip
call :pip_required

echo Installing Gradio...
pip install -e .

echo Installing Gradio Client...
pip install -e client\python