<script lang="ts">
	import type { VideoEditorData } from "./types";

	interface Props {
		type: "gallery" | "table";
		selected?: boolean;
		value?: VideoEditorData | null;
	}

	let { type, selected = false, value = null }: Props = $props();

	let video: HTMLVideoElement | undefined = $state();

	async function init(): Promise<void> {
		if (!video) return;
		video.muted = true;
		video.playsInline = true;
		video.controls = false;
		video.setAttribute("muted", "");
		try {
			await video.play();
			video.pause();
		} catch {}
	}
</script>

{#if value?.video?.url}
	<div
		class="container"
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
	>
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			muted
			playsinline
			bind:this={video}
			onloadeddata={init}
			onmouseover={() => video?.play()}
			onmouseout={() => video?.pause()}
			onfocus={() => video?.play()}
			onblur={() => video?.pause()}
			src={value.video.url}
		></video>
	</div>
{/if}

<style>
	.container :global(video) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.container.selected { border-color: var(--border-color-accent); }
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
		border: 2px solid var(--border-color-primary);
		height: var(--size-20);
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
