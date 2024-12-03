<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import {
		BlockLabel,
		Empty,
		IconButton,
		ShareButton,
		IconButtonWrapper
	} from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "./utils";
	import Image from "./Image.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import { Maximize, Minimize } from "@gradio/icons";

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
	export let show_fullscreen_button = true;

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
	let image_container: HTMLElement;

	onMount(() => {
		document.addEventListener("fullscreenchange", () => {
			is_full_screen = !!document.fullscreenElement;
		});
	});

	const toggle_full_screen = async (): Promise<void> => {
		if (!is_full_screen) {
			await image_container.requestFullscreen();
		} else {
			await document.exitFullscreen();
			is_full_screen = !is_full_screen;
		}
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
		<IconButtonWrapper>
			{#if !is_full_screen && show_fullscreen_button}
				<IconButton
					Icon={Maximize}
					label={is_full_screen ? "Exit full screen" : "View in full screen"}
					on:click={toggle_full_screen}
				/>
			{/if}

			{#if is_full_screen && show_fullscreen_button}
				<IconButton
					Icon={Minimize}
					label={is_full_screen ? "Exit full screen" : "View in full screen"}
					on:click={toggle_full_screen}
				/>
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
		</IconButtonWrapper>
		<button on:click={handle_click}>
			<div class:selectable class="image-frame">
				<Image src={value.url} alt="" loading="lazy" on:load />
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

	.image-frame {
		width: auto;
		height: 100%;
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
</style>
