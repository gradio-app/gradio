#!/bin/bash
set -e
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

git pull > /tmp/git_changes.txt

if ! grep -q "gradio/version.txt" /tmp/git_changes.txt; then
    echo "NO CHANGES"
else
    echo "Reloading..."
    INPUT_NAME=v$(cat ../gradio/version.txt)
    docker-compose build
    docker-compose up -d
fi
