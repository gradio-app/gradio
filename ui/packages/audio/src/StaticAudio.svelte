<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";

	import { Music } from "@gradio/icons";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: AudioData;
		play: undefined;
		pause: undefined;
		ended: undefined;
	}>();

	$: value &&
		dispatch("change", {
			name: name,
			data: value?.data
		});
</script>

<BlockLabel {show_label} Icon={Music} label={label || "Audio"} />
{#if value === null}
	<div class="placeholder-wrap">
		<div class="icon"><Music /></div>
	</div>
{:else}
	<audio
		controls
		preload="metadata"
		src={value.data}
		on:play
		on:pause
		on:ended
	/>
{/if}

<style>
	audio {
		width: var(--size-full);
		height: var(--size-14);
		padding: var(--size-2);
		margin-top: var(--size-7);
	}

	.placeholder-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--size-full);
		min-height: var(--size-32);
	}

	.icon {
		height: var(--size-5);
		opacity: 0.5;
	}
</style>
