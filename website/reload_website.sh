#!/bin/sh

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "Up-to-date. No restart."
elif [ $LOCAL = $BASE ]; then
    echo "Restarting..."
    git pull > /tmp/git_changes.txt
    if grep "demo/" /tmp/git_changes.txt 
    then
        cd upload_notebooks && python run.py && cd ..
    fi
    docker-compose build
    docker-compose up -d
fi