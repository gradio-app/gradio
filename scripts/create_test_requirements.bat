@echo off
setlocal EnableDelayedExpansion

:: Change to parent directory of script location
cd /d "%~dp0.."

:: Check for pip
call scripts\helpers.bat pip_required

echo Creating test requirements...
echo To match the CI environment, this script should be run from a Unix-like system in Python 3.9.

:: Change to test directory
cd test
pip install --upgrade pip-tools
pip-compile requirements.in --output-file requirements.txt