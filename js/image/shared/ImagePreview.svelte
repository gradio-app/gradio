<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, Empty, IconButton, ShareButton } from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "./utils";

	import { Image } from "@gradio/icons";
	import { type FileData, normalise_file } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let show_download_button = true;
	export let selectable = false;
	export let show_share_button = false;
	export let root: string;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		change: string;
		select: SelectData;
	}>();

	$: value = normalise_file(value, root, null);

	const handle_click = (evt: MouseEvent): void => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	};
</script>

<BlockLabel {show_label} Icon={Image} label={label || i18n("image.image")} />
{#if value === null || !value.url}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	<div class="icon-buttons">
		{#if show_download_button}
			<a
				href={value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={"image"}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		{/if}
		{#if show_share_button}
			<ShareButton
				{i18n}
				on:share
				on:error
				formatter={async (value) => {
					if (!value) return "";
					let url = await uploadToHuggingFace(value, "base64");
					return `<img src="${url}" />`;
				}}
				{value}
			/>
		{/if}
	</div>
	<button on:click={handle_click}>
		<img src={value.url} alt="" class:selectable loading="lazy" />
	</button>
{/if}

<style>
	img,
	button {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		display: block;
	}

	.selectable {
		cursor: crosshair;
	}

	.icon-buttons {
		display: flex;
		position: absolute;
		top: 6px;
		right: 6px;
		gap: var(--size-1);
	}
</style>
