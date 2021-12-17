#!/bin/sh
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

git pull > /tmp/git_changes.txt

if grep -q "Already up to date." /tmp/git_changes.txt; then
    echo "Already up to date. No reload."
else
    echo "Reloading..."
    if grep -q "demo/" /tmp/git_changes.txt; then
        cd upload_notebooks && python run.py && cd ..
    fi
    docker-compose build
    docker-compose up -d
fi