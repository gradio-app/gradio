<script lang="ts">
	import Video from "./shared/Video.svelte";
	import { playable } from "./shared/utils";
	import { type FileData } from "@gradio/client";

	interface Props {
		type: "gallery" | "table";
		selected?: boolean;
		value?: null | FileData;
		loop: boolean;
	}

	let { type, selected = false, value = null, loop }: Props = $props();

	let video: HTMLVideoElement | undefined = $state();

	async function init(): Promise<void> {
		if (!video) return;
		video.muted = true;
		video.playsInline = true;
		video.controls = false;
		video.setAttribute("muted", "");

		await video.play();
		video.pause();
	}
</script>

{#if value}
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
				onloadeddata={init}
				onmouseover={() => video?.play()}
				onmouseout={() => video?.pause()}
				src={value?.url}
				is_stream={false}
				{loop}
			/>
		</div>
	{:else}
		<div>{value}</div>
	{/if}
{/if}

<style>
	.container {
		flex: none;
		max-width: none;
	}
	.container :global(video) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: cover;
	}

	.container:hover,
	.container.selected {
		border-color: var(--border-color-accent);
	}
	.container.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		overflow: hidden;
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
