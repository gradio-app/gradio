export function createPeerConnection(track_callback) {
    var config = {
        sdpSemantics: 'unified-plan'
    };

    let pc;


    pc = new RTCPeerConnection(config);

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', () => {
        console.log(pc.iceGatheringState);
    }, false);

    pc.addEventListener('iceconnectionstatechange', () => {
        console.log(pc.iceConnectionState);
    }, false);

    pc.addEventListener('signalingstatechange', () => {
        console.log(pc.signalingState);
    }, false);

    // connect audio / video
    pc.addEventListener('track', (evt) => track_callback(evt));

    return pc;
}

export function start(webrtc_id, stream_callback, track_callback) {

    const pc = createPeerConnection(track_callback);

    stream_callback(pc);
    negotiate(pc, webrtc_id);

    // Build media constraints.

    // const constraints = {
    //     audio: false,
    //     video: false
    // };

    // Acquire media and start negociation.

    // if (constraints.audio || constraints.video) {
    //     navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    //         stream.getTracks().forEach((track) => {
    //             pc.addTrack(track, stream);
    //         });
    //         return negotiate(pc, webrtc_id);
    //     }, (err) => {
    //         alert('Could not acquire media: ' + err);
    //     });
    // } else {
    //     negotiate();
    // }
}

function negotiate(pc: RTCPeerConnection, webrtc_id: string) {
    return pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    }).then(() => {
        // wait for ICE gathering to complete
        return new Promise((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(() => {
        var offer = pc.localDescription;
        // var codec;

        // codec = document.getElementById('audio-codec').value;
        // if (codec !== 'default') {
        //     offer.sdp = sdpFilterCodec('audio', codec, offer.sdp);
        // }

        // codec = document.getElementById('video-codec').value;
        // if (codec !== 'default') {
        //     offer.sdp = sdpFilterCodec('video', codec, offer.sdp);
        // }

        // document.getElementById('offer-sdp').textContent = offer.sdp;
        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                webrtc_id: webrtc_id
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then((response) => {
        return response.json();
    }).then((answer) => {
        document.getElementById('answer-sdp').textContent = answer.sdp;
        return pc.setRemoteDescription(answer);
    }).catch((e) => {
        alert(e);
    });
}


export function stop(pc: RTCPeerConnection) {


    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach((transceiver) => {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    pc.getSenders().forEach((sender) => {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(() => {
        pc.close();
    }, 500);
}