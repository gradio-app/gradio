#!/bin/bash
set -e
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

git pull > /tmp/git_changes.txt

if ! grep -q "gradio/version.txt" /tmp/git_changes.txt; then
    echo "NO CHANGES"
else
    echo "Checking gradio version.."
    python check_version.py
    echo "Reloading..."
    docker-compose build
    docker-compose up -d
fi
