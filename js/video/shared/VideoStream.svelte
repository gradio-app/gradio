<script lang="ts">
	import Video from "./Video.svelte";
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { type FileDataFromStream } from "@gradio/client";
	import { Video as VideoIcon } from "@gradio/icons";

	export let value: FileDataFromStream | null = null;

	export let label = "test";
	export let show_label: boolean = true;
	let video: HTMLVideoElement;

	$: value_set = value !== null && value.url instanceof MediaStream;
	$: console.log("value_set", value_set);

	$: if (value_set) {
		video.srcObject = value!.url as MediaStream;
	}
</script>

<BlockLabel {show_label} Icon={VideoIcon} label={label || "Video"} />
<div class:hide={value_set}>
	<Empty unpadded_box={true} size="large"><VideoIcon /></Empty>
</div>
<div class="wrap" class:hide={!value_set}>
	<div class="mirror-wrap">
		<Video
			preload="auto"
			autoplay={true}
			bind:node={video}
			data-testid={`${label}-player`}
		></Video>
	</div>
</div>

<style lang="postcss">
	span {
		text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
	}

	progress {
		margin-right: var(--size-3);
		border-radius: var(--radius-sm);
		width: var(--size-full);
		height: var(--size-2);
	}

	progress::-webkit-progress-bar {
		border-radius: 2px;
		background-color: rgba(255, 255, 255, 0.2);
		overflow: hidden;
	}

	progress::-webkit-progress-value {
		background-color: rgba(255, 255, 255, 0.9);
	}

	.mirror {
		transform: scaleX(-1);
	}

	.mirror-wrap {
		position: relative;
		height: 100%;
		width: 100%;
	}

	.controls {
		position: absolute;
		bottom: 0;
		opacity: 0;
		transition: 500ms;
		margin: var(--size-2);
		border-radius: var(--radius-md);
		background: var(--color-grey-800);
		padding: var(--size-2) var(--size-1);
		width: calc(100% - 0.375rem * 2);
		width: calc(100% - var(--size-2) * 2);
	}
	.wrap:hover .controls {
		opacity: 1;
	}

	.inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: var(--size-2);
		padding-left: var(--size-2);
		width: var(--size-full);
		height: var(--size-full);
	}

	.icon {
		display: flex;
		justify-content: center;
		cursor: pointer;
		width: var(--size-6);
		color: white;
	}

	.time {
		flex-shrink: 0;
		margin-right: var(--size-3);
		margin-left: var(--size-3);
		color: white;
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}
	.wrap {
		position: relative;
		background-color: var(--background-fill-secondary);
		height: var(--size-full);
		width: var(--size-full);
		border-radius: var(--radius-xl);
	}
	.wrap :global(video) {
		height: var(--size-full);
		width: var(--size-full);
	}

	.hide {
		display: none;
	}
</style>
