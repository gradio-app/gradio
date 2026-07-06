<script lang="ts">
	import Slider from "./Slider.svelte";
	import { tick, type Snippet } from "svelte";
	import { BlockLabel, Empty, IconButton, DownloadLink } from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { Image } from "@gradio/icons";
	import { type I18nFormatter } from "@gradio/utils";
	import ClearImage from "./ClearImage.svelte";
	import ImageEl from "./ImageEl.svelte";

	import { Upload } from "@gradio/upload";

	import { type FileData, type Client } from "@gradio/client";

	let {
		value = $bindable<[FileData | null, FileData | null]>([null, null]),
		label = undefined,
		show_label,
		root,
		position = $bindable(0.5),
		upload_count = 2,
		show_download_button = true,
		slider_color,
		upload,
		stream_handler,
		max_file_size = null,
		i18n,
		max_height,
		upload_promise = $bindable(),
		dragging = $bindable(false),
		onclear,
		ondrag,
		onupload,
		children
	}: {
		value?: [FileData | null, FileData | null];
		label?: string;
		show_label: boolean;
		root: string;
		position?: number;
		upload_count?: number;
		show_download_button?: boolean;
		slider_color: string;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		max_file_size?: number | null;
		i18n: I18nFormatter;
		max_height: number;
		upload_promise?: Promise<any>;
		dragging?: boolean;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: (value: [FileData | null, FileData | null]) => void;
		children?: Snippet;
	} = $props();

	let value_ = $state<[FileData | null, FileData | null]>(
		value || [null, null]
	);

	let img: HTMLImageElement;
	let el_width = $state(0);
	let el_height = $state(0);

	async function handle_upload(
		detail: Blob | File | FileData | FileData[],
		n: number
	): Promise<void> {
		const file_data = Array.isArray(detail) ? detail : [detail as FileData];
		const new_value = [value[0], value[1]] as [
			FileData | null,
			FileData | null
		];
		if (file_data.length > 1) {
			new_value[n] = file_data[0];
		} else {
			new_value[n] = file_data[n];
		}
		value = new_value;
		await tick();

		onupload?.(new_value);
	}

	let old_value = "";

	$effect(() => {
		if (JSON.stringify(value) === old_value) return;
		old_value = JSON.stringify(value);
		value_ = value;
	});

	$effect(() => {
		ondrag?.(dragging);
	});
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
			onremove_image={() => {
				position = 0.5;
				value = [null, null];
				onclear?.();
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
						bind:upload_promise
						bind:dragging
						filetype="image/*"
						onload={(e) => handle_upload(e, 0)}
						disable_click={!!value?.[0]}
						{root}
						file_count="multiple"
						{upload}
						{stream_handler}
						{max_file_size}
					>
						{#if children}{@render children()}{/if}
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
					bind:upload_promise
					bind:dragging
					filetype="image/*"
					onload={(e) => handle_upload(e, 1)}
					disable_click={!!value?.[1]}
					{root}
					file_count="multiple"
					{upload}
					{stream_handler}
					{max_file_size}
				>
					{#if children}{@render children()}{/if}
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
