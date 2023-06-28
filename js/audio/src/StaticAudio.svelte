<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	import { Empty } from "@gradio/atoms";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { ShareData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, IconButton } from "@gradio/atoms";
	import { Music, Community } from "@gradio/icons";

	import { loaded } from "./utils";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label = true;
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

	function handle_ended(): void {
		dispatch("stop");
		dispatch("end");
	}
</script>

<BlockLabel {show_label} Icon={Music} float={false} label={label || "Audio"} />
{#if shareable && value !== null}
	<div class="icon-button">
		<IconButton
			Icon={Community}
			label="Share"
			on:click={async () => {
				if (!value) return;
				let url = await uploadToHuggingFace(value.data, "url");
				dispatch("share", {
					title: "",
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
		use:loaded={{ autoplay }}
		controls
		preload="metadata"
		src={value?.data}
		on:play
		on:pause
		on:ended={handle_ended}
		data-testid={`${label}-audio`}
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
