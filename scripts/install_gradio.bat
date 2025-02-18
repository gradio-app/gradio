@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pip
call scripts\helpers.bat pip_required

echo Installing Gradio...
pip install -e .

echo Installing Gradio Client...
pip install -e client\python