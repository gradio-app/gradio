<script lang="ts">
	import type { SelectData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import {
		BlockLabel,
		Empty,
		IconButton,
		ShareButton,
		IconButtonWrapper,
		FullscreenButton,
		DownloadLink
	} from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import { Download, Image as ImageIcon } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "./utils";
	import Image from "./Image.svelte";

	import type { I18nFormatter } from "@gradio/utils";
	import type { FileData } from "@gradio/client";

	let {
		value,
		label = undefined,
		show_label,
		buttons = [],
		on_custom_button_click = null,
		selectable = false,
		i18n,
		display_icon_button_wrapper_top_corner = false,
		fullscreen = $bindable(false),
		show_button_background = true,
		onselect,
		onfullscreen,
		onshare,
		onerror,
		onload
	}: {
		value: null | FileData;
		label?: string;
		show_label: boolean;
		buttons?: (string | CustomButtonType)[];
		on_custom_button_click?: ((id: number) => void) | null;
		selectable?: boolean;
		i18n: I18nFormatter;
		display_icon_button_wrapper_top_corner?: boolean;
		fullscreen?: boolean;
		show_button_background?: boolean;
		onselect?: (value: SelectData) => void;
		onfullscreen?: (fullscreen: boolean) => void;
		onshare?: (detail: unknown) => void;
		onerror?: (error: string) => void;
		onload?: () => void;
	} = $props();

	const handle_click = (evt: MouseEvent): void => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			onselect?.({ index: coordinates, value: null });
		}
	};

	let image_container: HTMLElement;
</script>

<BlockLabel
	{show_label}
	Icon={ImageIcon}
	label={!show_label ? "" : label || i18n("image.image")}
/>
{#if value == null || !value?.url}
	<Empty unpadded_box={true} size="large"><ImageIcon /></Empty>
{:else}
	<div class="image-container" bind:this={image_container}>
		<IconButtonWrapper
			display_top_corner={display_icon_button_wrapper_top_corner}
			show_background={show_button_background}
			{buttons}
			{on_custom_button_click}
		>
			{#if buttons.some((btn) => typeof btn === "string" && btn === "fullscreen")}
				<FullscreenButton
					{fullscreen}
					onclick={(is_fullscreen) => {
						fullscreen = is_fullscreen;
						onfullscreen?.(is_fullscreen);
					}}
				/>
			{/if}
			{#if buttons.some((btn) => typeof btn === "string" && btn === "download")}
				<DownloadLink href={value.url} download={value.orig_name || "image"}>
					<IconButton Icon={Download} label={i18n("common.download")} />
				</DownloadLink>
			{/if}
			{#if buttons.some((btn) => typeof btn === "string" && btn === "share")}
				<ShareButton
					{i18n}
					onshare={(detail) => onshare?.(detail)}
					onerror={(detail) => onerror?.(detail)}
					formatter={async (value) => {
						if (!value) return "";
						let url = await uploadToHuggingFace(value, "url");
						return `<img src="${url}" />`;
					}}
					{value}
				/>
			{/if}
		</IconButtonWrapper>
		<button onclick={handle_click}>
			<div class:selectable class="image-frame">
				<Image
					src={value.url}
					restProps={{ loading: "lazy", alt: "" }}
					{onload}
				/>
			</div>
		</button>
	</div>
{/if}

<style>
	.image-container {
		height: 100%;
		position: relative;
		min-width: var(--size-20);
	}

	.image-container button {
		width: var(--size-full);
		height: var(--size-full);
		border-radius: var(--radius-lg);

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-frame :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: scale-down;
	}

	.selectable {
		cursor: crosshair;
	}

	:global(.fullscreen-controls svg) {
		position: relative;
		top: 0px;
	}

	:global(.image-container:fullscreen) {
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	:global(.image-container:fullscreen img) {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: scale-down;
	}

	.image-frame {
		width: auto;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
