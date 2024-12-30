@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."

python -c "import gradio"
python -m ruff gradio test client
python -m ruff format --check gradio test client