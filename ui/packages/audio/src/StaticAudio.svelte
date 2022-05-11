<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockLabel } from "@gradio/atoms";

	import audio_icon from "./music.svg";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let style: string = "";
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

<BlockLabel {show_label} image={audio_icon} label={label || "Audio"} />
{#if value === null}
	<div class="min-h-[8rem] flex justify-center items-center">
		<img src={audio_icon} alt="" class="h-6 opacity-20" />
	</div>
{:else}
	<audio
		class="w-full h-14 p-2 mt-7"
		controls
		preload="metadata"
		src={value.data}
		on:play
		on:pause
		on:ended
	/>
{/if}
