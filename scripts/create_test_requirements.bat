@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Source the helpers script
call scripts\helpers.bat

:: Check for pip
call :pip_required

echo Creating test requirements...
echo To match the CI environment, this script should be run from a Unix-like system in Python 3.9.

:: Change to test directory
cd test
pip install --upgrade pip-tools
pip-compile requirements.in --output-file requirements.txt