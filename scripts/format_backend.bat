@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

echo Formatting the backend... Our style follows the ruff code style.

:: Check if gradio can be imported
python -c "import gradio"

:: Run ruff checks and formatting
python -m ruff check --fix gradio test client
python -m ruff format gradio test client

:: Run type checking script
call scripts\type_check_backend.bat