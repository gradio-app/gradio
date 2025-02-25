@echo off
setlocal enabledelayedexpansion

:: Get the root directory (equivalent to ROOTDIR)
set "SCRIPT_DIR=%~dp0"
set "ROOTDIR=%SCRIPT_DIR%.."
cd /d "%ROOTDIR%"

:: Check requirements: pnpm and jq
call scripts\helpers.bat pnpm_required
call scripts\helpers.bat jq_required

:: Get versions using jq
for /f "tokens=* usebackq" %%a in (`jq -r .version gradio/package.json`) do (
    set "GRADIO_VERSION=%%a"
)

for /f "tokens=* usebackq" %%a in (`jq -r .version client/python/gradio_client/package.json`) do (
    set "GRADIO_CLIENT_VERSION=%%a"
)

:: Set paths
set "GRADIO_WHEEL_PATH=%ROOTDIR%\dist-lite\gradio-!GRADIO_VERSION!-py3-none-any.whl"
set "GRADIO_CLIENT_FILE_PATH=%ROOTDIR%\client\python\dist\gradio_client-!GRADIO_CLIENT_VERSION!-py3-none-any.whl"

echo Checking for gradio and gradio_client wheel files...
echo GRADIO_WHEEL_PATH: !GRADIO_WHEEL_PATH!
echo GRADIO_CLIENT_FILE_PATH: !GRADIO_CLIENT_FILE_PATH!

:: Check if both files exist
if exist "!GRADIO_WHEEL_PATH!" if exist "!GRADIO_CLIENT_FILE_PATH!" (
    echo Found gradio and gradio_client wheel files...
) else (
    echo Building gradio and gradio_client wheel files...
    call pnpm --filter @gradio/lite pybuild
)

:: Build client and start dev server
call pnpm --filter @gradio/client build
call pnpm dev:lite