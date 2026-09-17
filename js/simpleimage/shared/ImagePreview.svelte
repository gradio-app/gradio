<script lang="ts">
	import {
		BlockLabel,
		Empty,
		IconButton,
		IconButtonWrapper,
		DownloadLink
	} from "@gradio/atoms";
	import { Download } from "@gradio/icons";

	import { Image as ImageIcon } from "@gradio/icons";
	import { type FileData } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";

	let {
		value,
		label = undefined,
		show_label,
		show_download_button = true,
		selectable = false,
		i18n
	}: {
		value: null | FileData;
		label?: string | undefined;
		show_label: boolean;
		show_download_button?: boolean;
		selectable?: boolean;
		i18n: I18nFormatter;
	} = $props();
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
