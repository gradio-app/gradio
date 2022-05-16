<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { Camera, Circle, Square } from "@gradio/icons";

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;

	export let mode: "image" | "video" = "image";

	const dispatch = createEventDispatcher();

	onMount(() => (canvas = document.createElement("canvas")));

	async function access_webcam() {
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
			dispatch("capture", data);
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

	access_webcam();
</script>

<div class="h-full min-h-[15rem] w-full relative">
	<!-- svelte-ignore a11y-media-has-caption -->
	<video bind:this={video_source} class="h-full w-full " />
	<button
		on:click={mode === "image" ? take_picture : take_recording}
		class="rounded-xl w-10 h-10 flex justify-center items-center absolute inset-x-0 bottom-2 md:bottom-4 xl:bottom-8 m-auto drop-shadow-lg bg-black/90"
	>
		{#if mode === "video"}
			{#if recording}
				<div class="w-2/4 h-2/4 dark:text-white opacity-80">
					<Square />
				</div>
			{:else}
				<div class="w-2/4 h-2/4 dark:text-white opacity-80">
					<Circle />
				</div>
			{/if}
		{:else}
			<div class="w-2/4 h-2/4 dark:text-white opacity-80">
				<Camera />
			</div>
		{/if}
	</button>
</div>
