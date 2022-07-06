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

    LATEST=$(git log -1 | fgrep commit)$(git log -1 | tail -1)
    curl -X POST -H 'Content-type: application/json' --data '{"text":"gradio.app relaoded successfully! :ship:\n\n Latest live commit:\n>`'"${LATEST}"'`"}' ${SLACK_WEBHOOK}

fi
