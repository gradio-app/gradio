<script lang="ts">
	import {
		BlockLabel,
		Empty,
		IconButton,
		IconButtonWrapper
	} from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { DownloadLink } from "@gradio/wasm/svelte";

	import { Image as ImageIcon } from "@gradio/icons";
	import { type FileData } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let show_download_button = true;
	export let selectable = false;
	export let i18n: I18nFormatter;
</script>

<BlockLabel
	{show_label}
	Icon={ImageIcon}
	label={label || i18n("image.image")}
/>
{#if value === null || !value.url}
	<Empty unpadded_box={true} size="large"><ImageIcon /></Empty>
{:else}
	<IconButtonWrapper>
		{#if show_download_button}
			<DownloadLink href={value.url} download={value.orig_name || "image"}>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</DownloadLink>
		{/if}
	</IconButtonWrapper>
	<button>
		<div class:selectable class="image-container">
			<img src={value.url} alt="" loading="lazy" />
		</div>
	</button>
{/if}

<style>
	.image-container {
		height: 100%;
	}
	.image-container :global(img),
	button {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: scale-down;
		display: block;
		border-radius: var(--radius-lg);
	}

	.selectable {
		cursor: crosshair;
	}
</style>
