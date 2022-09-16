#!/bin/bash
set -e
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

git pull > /tmp/git_changes.txt

if grep -q "Already up to date." /tmp/git_changes.txt; then
    echo "Already up to date. No reload."
else
    echo "Reloading..."
    docker-compose build
    docker-compose up -d
fi
