#!/bin/sh

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "Up-to-date. No restart."
elif [ $LOCAL = $BASE ]; then
    echo "Restarting..."
    git pull
    python refresh_google_credentials.py
    docker-compose build
    docker-compose restart -d
fi