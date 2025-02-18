@echo off
setlocal EnableDelayedExpansion

:: A collection of helper functions to check for required programs.
:: Helper functions can be called using `call scripts\helpers.bat function_name`.

:: Jump to MAIN to avoid running subroutines by default
goto :MAIN

:: Tell the user what programs to install for a specific task.
:: Arguments:
::   %1 - Name of the program or actual command, a string.
::   %2 - External link for easier installation help.
:: Outputs:
::   Prints the required program name and the external link (if given).
:program_required
where /q "%~1"
if %ERRORLEVEL% neq 0 (
    echo %~1 is not installed on the computer...
    if not "%~2"=="" (
        echo Check out this link: %~2
    )
    exit /b 1
)
exit /b 0

:: Check for the PIP program.
:pip_required
call :program_required "pip" "https://pip.pypa.io/en/stable/installation/"
exit /b %ERRORLEVEL%

:: Check for the NPM program.
:npm_required
call :program_required "npm" "https://nodejs.org/en/download/"
exit /b %ERRORLEVEL%

:: Check for the PNPM program.
:pnpm_required
call :program_required "pnpm" "https://pnpm.io/installation"
exit /b %ERRORLEVEL%

:: Check for the AWS CLI program.
:aws_required
call :program_required "aws" "https://aws.amazon.com/cli/"
exit /b %ERRORLEVEL%

:: Check for the Git program.
:git_required
call :program_required "git" "https://git-scm.com/downloads"
exit /b %ERRORLEVEL%

:: Check for the jq program.
:jq_required
call :program_required "jq" "https://jqlang.github.io/jq/"
exit /b %ERRORLEVEL%

:: Check for the foo program.
:foo_required
call :program_required "foo" "https://jqlang.github.io/jq/"
exit /b %ERRORLEVEL%

:MAIN
:: Handle command-line arguments to call specific subroutines
if not "%~1"=="" (
    call :%~1
    exit /b %ERRORLEVEL%
)