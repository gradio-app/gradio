<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, Empty, IconButton, ShareButton } from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "./utils";
	import Image from "./Image.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import { ZoomIn, ZoomOut, Maximize, Minimize } from "@gradio/icons";

	import { Image as ImageIcon } from "@gradio/icons";
	import { type FileData } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let show_download_button = true;
	export let selectable = false;
	export let show_share_button = false;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		change: string;
		select: SelectData;
	}>();

	const handle_click = (evt: MouseEvent): void => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	};

	let is_full_screen = false;
	let zoom_level = 1;

	const toggle_full_screen = (): void => {
		is_full_screen = !is_full_screen;
	};

	const zoom_in = (): void => {
		zoom_level = Math.min(zoom_level + 0.1, 3); // Max zoom of 3x
	};

	const zoom_out = (): void => {
		zoom_level = Math.max(zoom_level - 0.1, 0.1); // Min zoom of 0.1x
	};
</script>

<BlockLabel
	{show_label}
	Icon={ImageIcon}
	label={!show_label ? "" : label || i18n("image.image")}
/>
{#if value === null || !value.url}
	<Empty unpadded_box={true} size="large"><ImageIcon /></Empty>
{:else}
	<div class="icon-buttons" aria-hidden={is_full_screen}>
		<IconButton
			Icon={Maximize}
			label="Maximize"
			on:click={toggle_full_screen}
		/>

		{#if show_download_button}
			<DownloadLink href={value.url} download={value.orig_name || "image"}>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</DownloadLink>
		{/if}
		{#if show_share_button}
			<ShareButton
				{i18n}
				on:share
				on:error
				formatter={async (value) => {
					if (!value) return "";
					let url = await uploadToHuggingFace(value, "url");
					return `<img src="${url}" />`;
				}}
				{value}
			/>
		{/if}
	</div>
	<button on:click={handle_click}>
		<div class:selectable class="image-container">
			<Image src={value.url} alt="" loading="lazy" on:load />
		</div>
	</button>
{/if}

{#if is_full_screen}
	<div class="fullscreen-overlay" role="dialog" aria-modal="true">
		<div class="fullscreen-controls">
			<IconButton Icon={ZoomIn} label={"Zoom In"} on:click={zoom_in} />
			<IconButton Icon={ZoomOut} label={"Zoom Out"} on:click={zoom_out} />

			<IconButton
				Icon={Minimize}
				label="Minimize"
				on:click={toggle_full_screen}
			/>
		</div>
		<img
			src={value?.url}
			alt=""
			class="fullscreen-image"
			style="transform: scale({zoom_level}); transition: transform 0.2s ease-out;"
		/>
	</div>
{/if}

<style>
	.image-container {
		height: 100%;
	}
	.image-container :global(img),
	button {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		display: block;
		border-radius: var(--radius-lg);
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

	.fullscreen-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1001;
		background-color: rgba(0, 0, 0, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.fullscreen-controls {
		position: absolute;
		display: flex;
		top: 20px;
		right: 20px;
		gap: var(--size-1);
		color: var(--block-label-text-color);
	}

	:global(.fullscreen-controls svg) {
		position: relative;
		top: 0px;
	}

	.fullscreen-image {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		width: 100%;
		height: 100%;
	}
</style>
