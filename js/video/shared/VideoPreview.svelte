<script lang="ts">
	import { createEventDispatcher, afterUpdate, tick } from "svelte";
	import { BlockLabel, Empty, IconButton, ShareButton } from "@gradio/atoms";
	import type { FileData } from "@gradio/client";
	import { Video, Download } from "@gradio/icons";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";

	import Player from "./Player.svelte";
	import type { I18nFormatter } from "js/app/src/gradio_helper";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let label: string | undefined = undefined;
	export let show_label = true;
	export let autoplay: boolean;
	export let show_share_button = true;
	export let show_download_button = true;
	export let i18n: I18nFormatter;

	let old_value: FileData | null = null;
	let old_subtitle: FileData | null = null;

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
	}>();

	$: value && dispatch("change", value);

	afterUpdate(async () => {
		// needed to bust subtitle caching issues on Chrome
		if (
			value !== old_value &&
			subtitle !== old_subtitle &&
			old_subtitle !== null
		) {
			old_value = value;
			value = null;
			await tick();
			value = old_value;
		}
		old_value = value;
		old_subtitle = subtitle;
	});
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if value === null || value.url === undefined}
	<Empty unpadded_box={true} size="large"><Video /></Empty>
{:else}
	{#key value.url}
		<Player
			src={value.url}
			subtitle={subtitle?.url}
			{autoplay}
			on:play
			on:pause
			on:stop
			on:end
			mirror={false}
			{label}
			interactive={false}
		/>
	{/key}
	<div class="icon-buttons" data-testid="download-div">
		{#if show_download_button}
			<DownloadLink href={value.url} download={value.orig_name || value.path}>
				<IconButton Icon={Download} label="Download" />
			</DownloadLink>
		{/if}
		{#if show_share_button}
			<ShareButton
				{i18n}
				on:error
				on:share
				{value}
				formatter={async (value) => {
					if (!value) return "";
					let url = await uploadToHuggingFace(value.data, "url");
					return url;
				}}
			/>
		{/if}
	</div>
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
