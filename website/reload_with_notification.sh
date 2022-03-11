#!/bin/sh
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

ERROR=$(sh ./reload_website.sh 2>&1)

if ! [ $? -eq 0 ]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":"gradio.app is not tracking master :o:\n\n Error:\n```'"${ERROR}"'```"}' ${SLACK_WEBHOOK}
fi