<script lang="ts">
	import { playable } from "../../utils/helpers";
	import { onMount } from "svelte";

	export let type: "gallery" | "table";
	export let selected: boolean = false;
	export let value: string;
	export let samples_dir: string;
	let video: HTMLVideoElement;

	async function init() {
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
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if playable()}
	<video
		muted
		playsinline
		bind:this={video}
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
		on:mouseover={video.play}
		on:mouseout={video.pause}
		src={samples_dir + value}
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
