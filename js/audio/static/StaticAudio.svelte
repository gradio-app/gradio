<script lang="ts">
	import { uploadToHuggingFace } from "@gradio/utils";
	import { Empty } from "@gradio/atoms";
	import { ShareButton, IconButton, BlockLabel } from "@gradio/atoms";
	import { Download, Music } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import AudioPlayer from "../player/AudioPlayer.svelte";
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "@gradio/client";

	export let value: null | FileData = null;
	export let label: string;
	export let show_label = true;
	export let autoplay: boolean;
	export let show_download_button = true;
	export let show_share_button = false;
	export let i18n: I18nFormatter;
	export let waveform_settings = {};

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
	}>();

	$: value && dispatch("change", value);
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
				href={value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={value.url}
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
					let url = await uploadToHuggingFace(value.url, "url");
					return `<audio controls src="${url}"></audio>`;
				}}
				{value}
			/>
		{/if}
	</div>

	<AudioPlayer
		{value}
		{label}
		{autoplay}
		{i18n}
		{dispatch}
		{waveform_settings}
	/>
{:else}
	<Empty size="small">
		<Music />
	</Empty>
{/if}

<style>
	.icon-buttons {
		display: flex;
		position: absolute;
		top: 6px;
		right: 6px;
		gap: var(--size-1);
	}
</style>
