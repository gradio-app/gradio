<script lang="ts">
	import Slider from "./Slider.svelte";

	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import { Image, Download } from "@gradio/icons";
	import { type FileData } from "@gradio/client";
	import type { I18nFormatter } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";

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

	$: style = layer_images
		? `clip-path: inset(0 0 0 ${position * 100 * scale}%)`
		: "";

	export let el_width: number;

	let scale = 1;
	let zoom_position = { x: 50, y: 50 };
	let img: HTMLDivElement;

	function handle_wheel(e: WheelEvent): void {
		console.log("handle_wheel", e);
		e.preventDefault();

		// Calculate new scale
		const delta = e.deltaY * -0.01;
		const newScale = Math.min(Math.max(1, scale + delta), 4);

		if (newScale !== scale) {
			// Get mouse position relative to container
			const bounds = img.getBoundingClientRect();
			const x = ((e.clientX - bounds.left) / bounds.width) * 100;
			const y = ((e.clientY - bounds.top) / bounds.height) * 100;

			zoom_position = { x, y };
			scale = newScale;
			console.log("zoom_position", zoom_position);
			console.log("scale", scale);
		}
	}
</script>

<BlockLabel {show_label} Icon={Image} label={label || i18n("image.image")} />
{#if (value === null || value[0] === null || value[1] === null) && !show_single}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions-->
	<div class="icon-buttons">
		{#if show_download_button}
			<DownloadLink
				href={value[1].url}
				download={value[1].orig_name || "image"}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</DownloadLink>
		{/if}
	</div>
	<div class="slider-wrap" bind:clientWidth={el_width}>
		<Slider bind:position {slider_color} onwheel={handle_wheel} {scale}>
			<img
				src={value?.[0]?.url}
				alt=""
				loading="lazy"
				bind:this={img}
				style:transform="scale({scale})"
				style:transform-origin="{zoom_position.x}% {zoom_position.y}%"
			/>
			<img
				class:fixed={layer_images}
				class:hidden={!value?.[1]?.url}
				src={value?.[1]?.url}
				alt=""
				loading="lazy"
				{style}
				style:transform="scale({state.scale}) translate({state.zoom_position
					.x}%, {state.zoom_position.y}%)"
				style:transform-origin="center center"
				style:will-change="transform"
			/>
		</Slider>
	</div>
{/if}

<style>
	.slider-wrap {
		user-select: none;
		max-height: calc(100vh - 40px);
	}
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: cover;
	}

	.fixed {
		position: absolute;
		top: 0;
		left: 0;
	}

	.hidden {
		opacity: 0;
	}

	.icon-buttons {
		display: flex;
		position: absolute;
		right: 8px;
		z-index: var(--layer-top);
		top: 8px;
	}
</style>
