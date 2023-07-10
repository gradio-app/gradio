<script lang="ts">
	import { playable } from "../shared";
	import { onMount, getContext } from "svelte";

	export let type: "gallery" | "table";
	export let selected = false;
	export let value: string;
	export let samples_dir: string;
	let video: HTMLVideoElement;

	async function init(): Promise<void> {
		video.muted = true;
		video.playsInline = true;
		video.controls = false;
		video.setAttribute("muted", "");

		await video.play();
		video.pause();
	}

	onMount(() => {
		init();
	});

	let src = samples_dir + value;
	let ready = true;

	// For Wasm version, we need to fetch the file from the server running in the Wasm worker.
	const get_file_from_wasm = getContext<((pathname: string) => Promise<Blob>) | undefined>("get_file_from_wasm");
	$: if (get_file_from_wasm) {
		ready = false;
		const path = new URL(samples_dir + value).pathname;
		get_file_from_wasm(path).then((blob) => {
			src = URL.createObjectURL(blob);
			ready = true;
		})
	}
</script>

{#if playable() && ready}
	<video
		muted
		playsinline
		bind:this={video}
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
		on:mouseover={video.play}
		on:mouseout={video.pause}
		src={src}
	/>
{:else}
	<div>{value}</div>
{/if}

<style>
	video {
		flex: none;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		max-width: none;
	}

	video:hover,
	video.selected {
		border-color: var(--border-color-accent);
	}
	.table {
		margin: 0 auto;
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.gallery {
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
