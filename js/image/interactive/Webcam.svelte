<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { Camera, Circle, Square } from "@gradio/icons";
	import { _ } from "svelte-i18n";

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	export let streaming = false;
	export let pending = false;

	export let mode: "image" | "video" = "image";
	export let mirror_webcam: boolean;
	export let include_audio: boolean;

	const dispatch = createEventDispatcher<{
		stream: undefined;
		capture:
			| {
					data: FileReader["result"];
					name: string;
					is_example?: boolean;
			  }
			| string;
		error: string;
		start_recording: undefined;
		stop_recording: undefined;
	}>();

	onMount(() => (canvas = document.createElement("canvas")));

	async function access_webcam(): Promise<void> {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: include_audio
			});
			video_source.srcObject = stream;
			video_source.muted = true;
			video_source.play();
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch("error", $_("image.allow_webcam_access"));
			} else {
				throw err;
			}
		}
	}

	function take_picture(): void {
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

	function take_recording(): void {
		if (recording) {
			media_recorder.stop();
			let video_blob = new Blob(recorded_blobs, { type: mimeType });
			let ReaderObj = new FileReader();
			ReaderObj.onload = function (e): void {
				if (e.target) {
					dispatch("capture", {
						data: e.target.result,
						name: "sample." + mimeType.substring(6),
						is_example: false
					});
					dispatch("stop_recording");
				}
			};
			ReaderObj.readAsDataURL(video_blob);
		} else {
			dispatch("start_recording");
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
				mimeType: mimeType
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
</script>

<div class="wrap">
	<!-- svelte-ignore a11y-media-has-caption -->
	<video bind:this={video_source} class:flip={mirror_webcam} />
	{#if !streaming}
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
		display: flex;
		position: absolute;
		right: 0px;
		bottom: var(--size-2);
		left: 0px;
		justify-content: center;
		align-items: center;
		margin: auto;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		background-color: rgba(0, 0, 0, 0.9);
		width: var(--size-10);
		height: var(--size-10);
	}

	@media (--screen-md) {
		button {
			bottom: var(--size-4);
		}
	}

	@media (--screen-xl) {
		button {
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
