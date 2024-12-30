@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0.."

echo Running the backend unit tests...
python -m pytest test -m "not flaky"
