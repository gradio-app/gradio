#!/bin/bash

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
    echo "${1} is not installed in the computer..."
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
  program_required "pnpm" "https://pnpm.io/6.x/installation"
}

#######################################
# Check for the CircleCI program.
# Arguments:
#   None
# Outputs:
#   None
#######################################
function circleci_required() {
  program_required "circleci" "https://circleci.com/docs/1.0/local-cli/"
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
