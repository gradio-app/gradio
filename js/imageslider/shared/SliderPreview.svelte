<script lang="ts">
	import Slider from "./Slider.svelte";

	import {
		BlockLabel,
		Empty,
		IconButton,
		IconButtonWrapper,
		ShareButton,
		FullscreenButton,
	} from "@gradio/atoms";
	import { Image, Download } from "@gradio/icons";
	import { type FileData } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import { ZoomableImage } from "./zoom";
	import { onMount } from "svelte";
	import { tweened, type Tweened } from "svelte/motion";
	export let value: [null | FileData, null | FileData] = [null, null];
	export let label: string | undefined = undefined;
	export let show_download_button = true;
	export let show_label: boolean;
	export let root: string;
	export let i18n: I18nFormatter;
	export let position: number;
	export let layer_images = true;
	export let show_single = false;
	export let slider_color: string;
	export let show_fullscreen_button = true;

	export let el_width: number;

	let img: HTMLImageElement;
	let slider_wrap: HTMLDivElement;
	let image_container: HTMLDivElement;

	let transform: Tweened<{ x: number; y: number; z: number }> = tweened(
		{ x: 0, y: 0, z: 1 },
		{
			duration: 75,
		},
	);
	let parent_el: HTMLDivElement;

	$: coords_at_viewport = get_coords_at_viewport(
		position,
		viewport_width,
		$transform.x,
		$transform.z,
	);
	$: style = layer_images
		? `clip-path: inset(0 0 0 ${coords_at_viewport * 100}%)`
		: "";

	function get_coords_at_viewport(
		viewport_percent_x: number, // 0-1
		viewportWidth: number,
		tx: number, // image translation x (in pixels)

		scale: number, // image scale (uniform)
	): number {
		const vx = viewport_percent_x * viewportWidth;

		const ix = (vx - tx) / scale / img_width;

		return ix;
	}

	let img_width = 0;
	let viewport_width = 0;

	onMount(() => {
		img_width = img.getBoundingClientRect().width;
		viewport_width = slider_wrap.getBoundingClientRect().width;
		const zoomable_image = new ZoomableImage(slider_wrap, img);
		zoomable_image.subscribe(({ x, y, scale }) => {
			transform.set({ x, y, z: scale });
		});

		const observer = new ResizeObserver((entries) => {
			console.log("resize", entries);
			for (const entry of entries) {
				if (entry.target === slider_wrap) {
					viewport_width = entry.contentRect.width;
				}

				if (entry.target === img) {
					img_width = entry.contentRect.width;
				}
			}
		});
		observer.observe(slider_wrap);
		observer.observe(img);

		return () => {
			zoomable_image.destroy();
			observer.disconnect();
		};
	});

	let is_full_screen = false;
</script>

<BlockLabel {show_label} Icon={Image} label={label || i18n("image.image")} />
{#if (value === null || value[0] === null || value[1] === null) && !show_single}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	<div class="image-container" bind:this={image_container}>
		<IconButtonWrapper>
			{#if show_fullscreen_button}
				<FullscreenButton container={parent_el} bind:is_full_screen />
			{/if}

			{#if show_download_button}
				<DownloadLink
					href={value[1]?.url}
					download={value[1]?.orig_name || "image"}
				>
					<IconButton Icon={Download} label={i18n("common.download")} />
				</DownloadLink>
			{/if}
		</IconButtonWrapper>
		<div
			class="slider-wrap"
			bind:clientWidth={el_width}
			class:limit_height={!is_full_screen}
		>
			<Slider bind:position {slider_color} bind:el={slider_wrap} bind:parent_el>
				<img
					src={value?.[0]?.url}
					alt=""
					loading="lazy"
					bind:this={img}
					style:transform="translate({$transform.x}px, {$transform.y}px) scale({$transform.z})"
				/>
				<img
					class:fixed={layer_images}
					class:hidden={!value?.[1]?.url}
					src={value?.[1]?.url}
					alt=""
					loading="lazy"
					{style}
					style:transform="translate({$transform.x}px, {$transform.y}px) scale({$transform.z})"
				/>
			</Slider>
		</div>
	</div>
{/if}

<style>
	.slider-wrap {
		user-select: none;
		height: 100%;
		width: 100%;
		position: relative;
	}
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		transform-origin: top left;
		max-height: 100%;
		margin: auto;
	}

	.fixed {
		position: absolute;
		top: 0;
		left: 0;
		object-fit: contain;
		width: 100%;
		height: 100%;
		/* max-height: calc(100vh - 40px); */
	}

	.limit_height img {
		max-height: 500px;
	}

	.hidden {
		opacity: 0;
	}

	.image-container {
		height: 100%;
		position: relative;
		min-width: var(--size-20);
	}
</style>
