<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	import { Empty } from "@gradio/atoms";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ShareData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, IconButton } from "@gradio/atoms";

	import { Music, Community } from "@gradio/icons";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label: boolean = true;
	export let autoplay: boolean;
	export let shareable: boolean = false;

	const dispatch = createEventDispatcher<{
		change: AudioData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
		share: ShareData;
	}>();

	$: value &&
		dispatch("change", {
			name: name,
			data: value?.data
		});

	let el: HTMLAudioElement;

	let old_val: any;
	function value_has_changed(val: any) {
		if (val === old_val) return false;
		else {
			old_val = val;
			return true;
		}
	}

	$: autoplay && el && value_has_changed(value) && el.play();

	function handle_ended() {
		dispatch("stop");
		dispatch("end");
	}
</script>

<BlockLabel {show_label} Icon={Music} float={false} label={label || "Audio"} />
{#if shareable && value !== null}
	<div class="icon-button">
		<IconButton
			Icon={Community}
			label="Post"
			show_label={true}
			on:click={async () => {
				if (!value) return;
				let url = await uploadToHuggingFace(value.data, "url");
				dispatch("share", {
					title_from_inputs: true,
					description: `<audio controls src="${url}"></audio>`
				});
			}}
		/>
	</div>
{/if}

{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else}
	<audio
		bind:this={el}
		controls
		preload="metadata"
		src={value.data}
		on:play
		on:pause
		on:ended={handle_ended}
		data-testid={`${label}-static-audio`}
	/>
{/if}

<style>
	audio {
		padding: var(--size-2);
		width: var(--size-full);
		height: var(--size-14);
	}
	.icon-button {
		position: absolute;
		top: 6px;
		right: 6px;
	}
</style>
