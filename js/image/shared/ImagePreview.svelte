<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
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
	let image_container: HTMLElement;

	onMount(() => {
		document.addEventListener("fullscreenchange", () => {
			is_full_screen = !!document.fullscreenElement;
		});
	});

	const toggle_full_screen = async (): Promise<void> => {
		if (!document.fullscreenElement) {
			await image_container.requestFullscreen();
		} else {
			await document.exitFullscreen();
			is_full_screen = !is_full_screen;
		}
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
	<div class="image-container" bind:this={image_container}>
		<div class="icon-buttons">
			{#if !is_full_screen}
				<IconButton
					Icon={Maximize}
					label={is_full_screen ? "Exit full screen" : "View in full screen"}
					on:click={toggle_full_screen}
				/>
			{/if}

			{#if is_full_screen}
				<IconButton
					Icon={Minimize}
					label={is_full_screen ? "Exit full screen" : "View in full screen"}
					on:click={toggle_full_screen}
				/>
				<IconButton Icon={ZoomIn} label={"Zoom In"} on:click={zoom_in} />
				<IconButton Icon={ZoomOut} label={"Zoom Out"} on:click={zoom_out} />
			{/if}

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
			<div class:selectable>
				<Image
					src={value.url}
					alt=""
					loading="lazy"
					on:load
					style="transform: scale({zoom_level}); transition: transform 0.2s ease-out;"
				/>
			</div>
		</button>
	</div>
{/if}

<style>
	.image-container {
		height: 100%;
		position: relative;
	}
	.image-container :global(img),
	button {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		display: block;
		border-radius: var(--radius-lg);

		display: flex;
		align-items: center;
		justify-content: center;
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
		z-index: 1;
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
		object-fit: contain;
	}
</style>
