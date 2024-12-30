@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source the helpers script
call scripts\helpers.bat

:: Check for pip
call :pip_required

echo Installing requirements before running tests...
pip install --upgrade pip
pip install -r test\requirements.txt
pip install -r requirements-oauth.txt
pip install -e client\python