<script lang="ts">
	import Video from "./shared/Video.svelte";
	import { playable } from "./shared/utils";

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
</script>

{#if playable()}
	<div
		class="container"
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
	>
		<Video
			muted
			playsinline
			bind:node={video}
			on:loadeddata={init}
			on:mouseover={video.play.bind(video)}
			on:mouseout={video.pause.bind(video)}
			src={samples_dir + value}
		/>
	</div>
{:else}
	<div>{value}</div>
{/if}

<style>
	.container {
		flex: none;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		max-width: none;
	}

	.container:hover,
	.container.selected {
		border-color: var(--border-color-accent);
	}
	.container.table {
		margin: 0 auto;
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.container.gallery {
		height: var(--size-20);
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
