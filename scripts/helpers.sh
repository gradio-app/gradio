#!/bin/bash -eu

#######################################
# Tell the user what programs to install for a specific task.
# Arguments:
#   Name of the program or actual command, a string.
#   External link for easier installation help.
# Outputs:
#   Prints the required program name and the external link (if given).
#######################################
function program_required() {
  if [ ! -x "$(command -v ${1})" ]; then
    echo "${1} is not installed on the computer..."
    if [ "${2}" ]; then
      echo "Check out this link: ${2}"
    fi
    exit 1
  fi
}

#######################################
# Check for the PIP program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function pip_required() {
  program_required "pip" "https://pip.pypa.io/en/stable/installation/"
}

#######################################
# Check for the NPM program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function npm_required() {
  program_required "npm" "https://nodejs.org/en/download/"
}

#######################################
# Check for the PNPM program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function pnpm_required() {
  program_required "pnpm" "https://pnpm.io/installation"
}

#######################################
# Check for the AWS CLI program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function aws_required() {
  program_required "aws" "https://aws.amazon.com/cli/"
}

#######################################
# Check for the Git program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function git_required() {
  program_required "git" "https://git-scm.com/downloads"
}

#######################################
# Check for the jq program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function jq_required() {
  program_required "jq" "https://jqlang.github.io/jq/"
}

function foo_required() {
  program_required "foo" "https://jqlang.github.io/jq/"
}
