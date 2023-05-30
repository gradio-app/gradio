<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { Camera, Circle, Square, Undo } from "@gradio/icons";

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let facing_mode: string = "user";
	export let streaming: boolean = false;
	export let pending: boolean = false;

	export let mode: "image" | "video" = "image";
	export let mirror_webcam: boolean;
	export let include_audio: boolean;

	const dispatch = createEventDispatcher();

	onMount(() => (canvas = document.createElement("canvas")));

	async function access_webcam() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: facing_mode },
				audio: include_audio,
			});
			video_source.srcObject = stream;
			video_source.muted = true;
			video_source.play();
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch("error", "Please allow access to the webcam for recording.");
				return null;
			} else {
				throw err;
			}
		}
	}

	function switch_cameras() {
		facing_mode = facing_mode === "user" ? "environment" : "user";
		access_webcam();
	}

	function take_picture() {
		var context = canvas.getContext("2d")!;

		if (video_source.videoWidth && video_source.videoHeight) {
			canvas.width = video_source.videoWidth;
			canvas.height = video_source.videoHeight;
			context.drawImage(
				video_source,
				0,
				0,
				video_source.videoWidth,
				video_source.videoHeight
			);

			var data = canvas.toDataURL("image/png");
			dispatch(streaming ? "stream" : "capture", data);
		}
	}

	let recording = false;
	let recorded_blobs: BlobPart[] = [];
	let stream: MediaStream;
	let mimeType: string;
	let media_recorder: MediaRecorder;

	function take_recording() {
		if (recording) {
			media_recorder.stop();
			let video_blob = new Blob(recorded_blobs, { type: mimeType });
			let ReaderObj = new FileReader();
			ReaderObj.onload = function (e) {
				if (e.target) {
					dispatch("capture", {
						data: e.target.result,
						name: "sample." + mimeType.substring(6),
						is_example: false,
					});
				}
			};
			ReaderObj.readAsDataURL(video_blob);
		} else {
			recorded_blobs = [];
			let validMimeTypes = ["video/webm", "video/mp4"];
			for (let validMimeType of validMimeTypes) {
				if (MediaRecorder.isTypeSupported(validMimeType)) {
					mimeType = validMimeType;
					break;
				}
			}
			if (mimeType === null) {
				console.error("No supported MediaRecorder mimeType");
				return;
			}
			media_recorder = new MediaRecorder(stream, {
				mimeType: mimeType,
			});
			media_recorder.addEventListener("dataavailable", function (e) {
				recorded_blobs.push(e.data);
			});
			media_recorder.start(200);
		}
		recording = !recording;
	}

	access_webcam();

	if (streaming && mode === "image") {
		window.setInterval(() => {
			if (video_source && !pending) {
				take_picture();
			}
		}, 500);
	}

	let show_camera_toggle = is_iphone_or_ipad();

	function is_iphone_or_ipad() {
		return (
			navigator.userAgent.indexOf(" iPhone ") >= 0 ||
			(typeof navigator.maxTouchPoints === "number" &&
				navigator.maxTouchPoints > 2 &&
				typeof navigator.vendor === "string" &&
				navigator.vendor.indexOf("Apple") >= 0)
		);
	}

	async function check_for_phone_cameras() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		let front = false;
		let back = false;
		for (const device of devices) {
			const device_string = device?.label.toLocaleLowerCase();
			if (device_string.indexOf("front") > 1) {
				front = true;
			}

			if (device_string.indexOf("back") > 1) {
				back = true;
			}

			if (front && back) {
				show_camera_toggle = true;
				break;
			}
		}
	}

	check_for_phone_cameras();
</script>

<div class="wrap">
	<!-- svelte-ignore a11y-media-has-caption -->
	<video bind:this={video_source} class:flip={mirror_webcam} />
	{#if !streaming}
		<div class="button_container">
			<button on:click={mode === "image" ? take_picture : take_recording}>
				{#if mode === "video"}
					{#if recording}
						<div class="icon">
							<Square />
						</div>
					{:else}
						<div class="icon">
							<Circle />
						</div>
					{/if}
				{:else}
					<div class="icon">
						<Camera />
					</div>
				{/if}
			</button>
			{#if show_camera_toggle}
				<button on:click={switch_cameras}>
					<div class="icon">
						<Undo />
					</div>
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		min-height: var(--size-60);
	}

	video {
		width: var(--size-full);
		height: var(--size-full);
	}

	button {
		display: inline-flex;
		position: relative;
		justify-content: center;
		align-items: center;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		background-color: rgba(0, 0, 0, 0.9);
		width: var(--size-10);
		height: var(--size-10);
	}

	button:not(:last-child) {
		margin-right: var(--size-10);
	}

	.button_container {
		display: flex;
		position: absolute;
		bottom: var(--size-2);
		justify-content: center;
		width: 100%;
	}

	@media (--screen-md) {
		.button_container {
			bottom: var(--size-4);
		}
	}

	@media (--screen-xl) {
		.button_container {
			bottom: var(--size-8);
		}
	}

	.icon {
		opacity: 0.8;
		width: 50%;
		height: 50%;
		color: white;
	}

	.flip {
		transform: scaleX(-1);
	}
</style>
