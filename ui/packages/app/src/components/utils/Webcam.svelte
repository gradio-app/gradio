<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	export let static_src: string;
	export let mode: "video" | "image";
	let recording = false;

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;

	const dispatch = createEventDispatcher();

	onMount(() => (canvas = document.createElement("canvas")));

	async function accessWebcam() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
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