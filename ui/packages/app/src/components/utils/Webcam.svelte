<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	export let static_src: string;
	export let mode: "video" | "image";

	let recording = false;
	let recorded_blobs: BlobPart[] = [];
	let stream: MediaStream;
	let mimeType: string;
	let media_recorder: MediaRecorder;

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;

	const dispatch = createEventDispatcher();

	onMount(() => (canvas = document.createElement("canvas")));

	async function accessWebcam() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: true
			});
			video_source.srcObject = stream;
			video_source.play();
		} catch (error) {
			console.error(error);
		}
	}

	function takePicture() {
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
			dispatch("capture", data);
		}
	}

	function takeRecording() {
		if (recording) {
			media_recorder.stop();
			let video_blob = new Blob(recorded_blobs, { type: mimeType });
			let ReaderObj = new FileReader();
			ReaderObj.onload = function (e) {
				if (e.target) {
					dispatch("capture", {
						data: e.target.result,
						name: "sample." + mimeType.substring(6),
						is_example: false
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
				mimeType: mimeType
			});
			media_recorder.addEventListener("dataavailable", function (e) {
				recorded_blobs.push(e.data);
			});
			media_recorder.start(200);
		}
		recording = !recording;
	}

	accessWebcam();
</script>

<div class="h-full w-full relative">
	<!-- svelte-ignore a11y-media-has-caption -->
	<video bind:this={video_source} class=" h-full w-full" />
	<button
		on:click={mode === "image" ? takePicture : takeRecording}
		class="rounded-full w-10 h-10 flex justify-center items-center absolute inset-x-0 bottom-2 m-auto drop-shadow-lg"
		class:recording
	>
		{#if !recording}
			<img
				style="color: white"
				src="{static_src}/static/img/camera.svg"
				alt="take a screenshot"
				class="w-2/4 h-2/4"
			/>
		{/if}
	</button>
</div>

<style lang="postcss">
	button {
		@apply bg-gray-700;
	}
	button.recording {
		@apply bg-red-700 border-4 border-red-600;
	}
</style>
