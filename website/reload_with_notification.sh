#!/bin/sh
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

if sh ./reload_website.sh; then
    LATEST=$(git log -1 | fgrep commit)$(git log -1 | tail -1)
    curl -X POST -H 'Content-type: application/json' --data '{"text":"gradio.app relaoded successfully! :ship:\n\n Latest live commit:\n>`'"${LATEST}"'`"}' ${SLACK_WEBHOOK}
else
    LOGS=$(tail -n 25 /var/mail/ubuntu)
    curl -X POST -H 'Content-type: application/json' --data '{"text":"gradio.app is not tracking master :o:\n\n Logs:\n```'"${LOGS}"'```"}' ${SLACK_WEBHOOK}
fi