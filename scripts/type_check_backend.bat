@echo off
setlocal

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check pip requirement
call scripts\helpers.bat pip_required

echo Adding py.typed file to gradio.
type nul > gradio\py.typed

ty check ^
  --exclude "gradio/themes/" ^
  --exclude "gradio/_frontend_code/" ^
  --exclude "gradio/components/*_plot.py" ^
  --exclude "gradio/node/*.py" ^
  --exclude "gradio/_frontend_code/*.py" ^
  --exclude "gradio/cli/commands/cli_env_info.py" ^
  --exclude "**/*.ipynb" ^
  gradio demo test
