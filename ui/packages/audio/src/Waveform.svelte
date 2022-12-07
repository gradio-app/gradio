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

	let time = 0;
	let duration: number;
	$: completion = time / duration;
</script>

<BlockLabel {show_label} Icon={Music} label={label || "Audio"} />
<div class="relative">
	<div
		class="absolute top-0 left-0 h-full pointer-events-none bg-white !bg-opacity-30"
		style="width: {completion * 100}%"
	/>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		controls
		preload="metadata"
		on:play
		on:pause
		on:ended
		bind:duration
		bind:currentTime={time}
	>
		<source src={value?.data} />
	</video>
</div>
