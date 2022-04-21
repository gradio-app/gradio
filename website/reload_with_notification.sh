#!/bin/bash
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"


ERROR=$(bash ./reload_website.sh 2>&1)

if ! [ $? -eq 0 ]; then
    DATA=":x: gradio.app is not tracking main, see the error in the replies :arrow_down: <@${MEMBERID}>"
    RESPONSE=$(curl https://slack.com/api/chat.postMessage -X POST -H 'Content-type: application/json; charset=utf-8' -H "Authorization: Bearer ${TOKEN}" --data '{"channel":"'${CHANNELID}'", "text":"'"${DATA}"'"}')
    THREAD_TS="$( jq -r  '.ts' <<< "${RESPONSE}")"
    DATA=$( jo text="$(echo "\`\`\`'$ERROR'\`\`\`")" channel=$CHANNELID thread_ts="'$THREAD_TS'")
    _=$(curl https://slack.com/api/chat.postMessage -X POST -H 'Content-type: application/json; charset=utf-8' -H "Authorization: Bearer ${TOKEN}" --data "$DATA")
fi
