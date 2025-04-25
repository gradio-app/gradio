<script lang="ts">
	import Slider from "./Slider.svelte";
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { Image } from "@gradio/icons";
	import { type SelectData, type I18nFormatter } from "@gradio/utils";
	import ClearImage from "./ClearImage.svelte";
	import ImageEl from "./ImageEl.svelte";

	import { Upload } from "@gradio/upload";
	import { DownloadLink } from "@gradio/wasm/svelte";

	import { type FileData, type Client } from "@gradio/client";

	export let value: [FileData | null, FileData | null];

	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let root: string;
	export let position: number;
	export let upload_count = 2;

	export let show_download_button = true;
	export let slider_color: string;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let max_file_size: number | null = null;
	export let i18n: I18nFormatter;
	export let max_height: number;

	let value_: [FileData | null, FileData | null] = value || [null, null];

	let img: HTMLImageElement;
	let el_width: number;
	let el_height: number;

	async function handle_upload(
		{ detail }: CustomEvent<FileData[]>,
		n: number
	): Promise<void> {
		const new_value = [value[0], value[1]] as [
			FileData | null,
			FileData | null
		];
		if (detail.length > 1) {
			new_value[n] = detail[0];
		} else {
			new_value[n] = detail[n];
		}
		value = new_value;
		await tick();

		dispatch("upload", new_value);
	}

	let old_value = "";

	$: if (JSON.stringify(value) !== old_value) {
		old_value = JSON.stringify(value);
		value_ = value;
	}

	const dispatch = createEventDispatcher<{
		change: string | null;
		stream: string | null;
		edit: undefined;
		clear: undefined;
		drag: boolean;
		upload: [FileData | null, FileData | null];
		select: SelectData;
	}>();

	export let dragging = false;

	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={Image} label={label || i18n("image.image")} />

<div
	data-testid="image"
	class="image-container"
	bind:clientWidth={el_width}
	bind:clientHeight={el_height}
>
	{#if value?.[0]?.url || value?.[1]?.url}
		<ClearImage
			on:remove_image={() => {
				position = 0.5;
				value = [null, null];
				dispatch("clear");
			}}
		/>
	{/if}
	{#if value?.[1]?.url}
		<div class="icon-buttons">
			{#if show_download_button}
				<DownloadLink
					href={value[1].url}
					download={value[1].orig_name || "image"}
				>
					<IconButton Icon={Download} />
				</DownloadLink>
			{/if}
		</div>
	{/if}
	<Slider
		bind:position
		disabled={upload_count == 2 || !value?.[0]}
		{slider_color}
	>
		<div
			class="upload-wrap"
			style:display={upload_count === 2 ? "flex" : "block"}
			class:side-by-side={upload_count === 2}
		>
			{#if !value_?.[0]}
				<div class="wrap" class:half-wrap={upload_count === 1}>
					<Upload
						bind:dragging
						filetype="image/*"
						on:load={(e) => handle_upload(e, 0)}
						disable_click={!!value?.[0]}
						{root}
						file_count="multiple"
						{upload}
						{stream_handler}
						{max_file_size}
					>
						<slot />
					</Upload>
				</div>
			{:else}
				<ImageEl
					variant="upload"
					src={value_[0]?.url}
					alt=""
					bind:img_el={img}
					{max_height}
				/>
			{/if}

			{#if !value_?.[1] && upload_count === 2}
				<Upload
					bind:dragging
					filetype="image/*"
					on:load={(e) => handle_upload(e, 1)}
					disable_click={!!value?.[1]}
					{root}
					file_count="multiple"
					{upload}
					{stream_handler}
					{max_file_size}
				>
					<slot />
				</Upload>
			{:else if !value_?.[1] && upload_count === 1}
				<div
					class="empty-wrap fixed"
					style:width="{el_width * (1 - position)}px"
					style:transform="translateX({el_width * position}px)"
					class:white-icon={!value?.[0]?.url}
				>
					<Empty unpadded_box={true} size="large"><Image /></Empty>
				</div>
			{:else if value_?.[1]}
				<ImageEl
					variant="upload"
					src={value_[1].url}
					alt=""
					fixed={upload_count === 1}
					transform="translate(0px, 0px) scale(1)"
					{max_height}
				/>
			{/if}
		</div>
	</Slider>
</div>

<style>
	.upload-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
	}

	.wrap {
		width: 100%;
	}

	.half-wrap {
		width: 50%;
	}
	.image-container,
	.empty-wrap {
		width: var(--size-full);
		height: var(--size-full);
	}

	.fixed {
		--anim-block-background-fill: 255, 255, 255;
		position: absolute;
		top: 0;
		left: 0;
		background-color: rgba(var(--anim-block-background-fill), 0.8);
		z-index: 0;
	}

	@media (prefers-color-scheme: dark) {
		.fixed {
			--anim-block-background-fill: 31, 41, 55;
		}
	}

	.side-by-side :global(img) {
		/* width: 100%; */
		width: 50%;
		object-fit: contain;
	}

	.empty-wrap {
		pointer-events: none;
	}

	.icon-buttons {
		display: flex;
		position: absolute;
		right: 8px;
		z-index: var(--layer-top);
		top: 8px;
	}
</style>
