export function createPeerConnection(pc, node) {
	// register some listeners to help debugging
	pc.addEventListener(
		"icegatheringstatechange",
		() => {
			console.log(pc.iceGatheringState);
		},
		false
	);

	pc.addEventListener(
		"iceconnectionstatechange",
		() => {
			console.log(pc.iceConnectionState);
		},
		false
	);

	pc.addEventListener(
		"signalingstatechange",
		() => {
			console.log(pc.signalingState);
		},
		false
	);

	// connect audio / video from server to local
	pc.addEventListener("track", (evt) => {
		console.log("track event listener");
		if (evt.track.kind == "video") {
			console.log("streams", evt.streams);
			node.srcObject = evt.streams[0];
			console.log("node.srcOject", node.srcObject);
		}
	});

	return pc;
}

export async function start(webrtc_id, stream_callback, pc, node, root) {
	pc = createPeerConnection(pc, node);
	const stream = stream_callback();
	if (stream) {
		stream.getTracks().forEach((track) => {
			track.applyConstraints({ frameRate: { max: 30 } });

			console.log("Track stream callback", track);
			pc.addTrack(track, stream);
		});
	} else {
		console.log("Creating transceiver!");
		pc.addTransceiver("video", { direction: "recvonly" });
	}

	await negotiate(pc, webrtc_id, root);
	return pc;
}

async function negotiate(
	pc: RTCPeerConnection,
	webrtc_id: string,
	root: string
): Promise<void> {
	return pc
		.createOffer()
		.then((offer) => {
			console.log("offer", offer);
			return pc.setLocalDescription(offer);
		})
		.then(() => {
			// wait for ICE gathering to complete
			return new Promise<void>((resolve) => {
				console.log("ice gathering state", pc.iceGatheringState);
				if (pc.iceGatheringState === "complete") {
					resolve();
				} else {
					const checkState = () => {
						if (pc.iceGatheringState === "complete") {
							console.log("ice complete");
							pc.removeEventListener("icegatheringstatechange", checkState);
							resolve();
						}
					};
					pc.addEventListener("icegatheringstatechange", checkState);
				}
			});
		})
		.then(() => {
			console.log("before offer");
			var offer = pc.localDescription;
			console.log("webrtc_id", webrtc_id);
			return fetch(`${root}/offer`, {
				body: JSON.stringify({
					sdp: offer.sdp,
					type: offer.type,
					webrtc_id: webrtc_id
				}),
				headers: {
					"Content-Type": "application/json"
				},
				method: "POST"
			});
		})
		.then((response) => {
			console.log("response", response);
			return response.json();
		})
		.then((answer) => {
			console.log("answer", answer);
			return pc.setRemoteDescription(answer);
		})
		.catch((e) => {
			alert(e);
		});
}

export function stop(pc: RTCPeerConnection) {
	console.log("pc", pc);
	console.log("STOPPING");
	// close transceivers
	if (pc.getTransceivers) {
		pc.getTransceivers().forEach((transceiver) => {
			if (transceiver.stop) {
				transceiver.stop();
			}
		});
	}

	// close local audio / video
	if (pc.getSenders()) {
		pc.getSenders().forEach((sender) => {
			if (sender.track && sender.track.stop) sender.track.stop();
		});
	}

	// close peer connection
	setTimeout(() => {
		pc.close();
	}, 500);
}
