#!/bin/bash
. /home/ubuntu/.bashrc
export PATH="/usr/local/bin:/usr/bin:/bin"

OUTPUT=$(bash ./reload_website.sh 2>&1)

if ! [ $? -eq 0 ]; then
    OUTPUT=${OUTPUT: -2000}
    DATA=":x: gradio.app is not tracking main, see the error in the replies :arrow_down: <@${MEMBERID}>"
    RESPONSE=$(curl https://slack.com/api/chat.postMessage -X POST -H 'Content-type: application/json; charset=utf-8' -H "Authorization: Bearer ${TOKEN}" --data '{"channel":"'${CHANNELID}'", "text":"'"${DATA}"'"}')
    THREAD_TS="$( jq -r  '.ts' <<< "${RESPONSE}")"
    DATA=$( jo text="$(echo "\`\`\`'$OUTPUT'\`\`\`")" channel=$CHANNELID thread_ts="'$THREAD_TS'")
    _=$(curl https://slack.com/api/chat.postMessage -X POST -H 'Content-type: application/json; charset=utf-8' -H "Authorization: Bearer ${TOKEN}" --data "$DATA")
elif grep -q "Already up to date." /tmp/git_changes.txt; then
    :
else 
    LATEST=$(git log -1 | fgrep commit)$(git log -1 | tail -1)
    curl -X POST -H 'Content-type: application/json' --data '{"text":"gradio.app relaoded successfully! :ship:\n\n Latest live commit:\n>`'"${LATEST}"'`"}' ${SLACK_WEBHOOK}
fi
