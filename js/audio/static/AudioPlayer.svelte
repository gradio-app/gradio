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
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, ShareButton, IconButton } from "@gradio/atoms";
	import { Music, Download } from "@gradio/icons";

	import { loaded } from "../shared/utils";
	import type { I18nFormatter } from "js/app/src/gradio_helper";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label = true;
	export let autoplay: boolean;
	export let show_download_button = true;
	export let show_share_button = false;

	const dispatch = createEventDispatcher<{
		change: AudioData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
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

	export let i18n: I18nFormatter;
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={false}
	label={label || i18n("audio.audio")}
/>
{#if value !== null}
	<div class="icon-buttons">
		{#if show_download_button}
			<a
				href={value.data}
				target={window.__is_colab__ ? "_blank" : null}
				download={value.name}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		{/if}
		{#if show_share_button}
			<ShareButton
				{i18n}
				on:error
				on:share
				formatter={async (value) => {
					if (!value) return "";
					let url = await uploadToHuggingFace(value.data, "url");
					return `<audio controls src="${url}"></audio>`;
				}}
				{value}
			/>
		{/if}
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
	.icon-buttons {
		display: flex;
		position: absolute;
		top: 6px;
		right: 6px;
		gap: var(--size-1);
	}
</style>
