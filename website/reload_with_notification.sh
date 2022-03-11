#!/bin/sh
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

ERROR=$(sh ./reload_website.sh 2>&1)

if ! [ $? -eq 0 ]; then
    data=$( jo text="$(echo "gradio.app is not tracking master :o: \nError:\n\n\`\`\`'$ERROR'\`\`\`")")
    echo "$data"
    curl -X POST -H 'Content-type: application/json' --data "$data" ${SLACK_WEBHOOK}
fi