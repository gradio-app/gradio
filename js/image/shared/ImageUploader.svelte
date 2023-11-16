<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import type { SelectData, I18nFormatter } from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";
	import {
		Webcam as WebcamIcon,
		ImagePaste,
		Upload as UploadIcon
	} from "@gradio/icons";
	import Webcam from "./Webcam.svelte";
	import { Toolbar, IconButton } from "@gradio/atoms";

	import { Upload } from "@gradio/upload";
	import { type FileData, normalise_file } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let selectable = false;
	export let root: string;
	export let i18n: I18nFormatter;

	let upload: Upload;
	let uploading = false;
	export let active_tool: "webcam" | null = null;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		value = normalise_file(detail, root, null);
		dispatch("upload");
	}

	async function handle_save(img_blob: Blob | any): Promise<void> {
		pending = true;
		const f = await upload.load_files([new File([img_blob], `webcam.png`)]);

		value = f?.[0] || null;
		if (!streaming) active_tool = null;

		await tick();

		dispatch(streaming ? "stream" : "change");
		pending = false;
	}

	$: if (uploading) value = null;

	$: value && !value.url && (value = normalise_file(value, root, null));

	const dispatch = createEventDispatcher<{
		change?: never;
		stream?: never;
		clear?: never;
		drag: boolean;
		upload?: never;
		select: SelectData;
	}>();

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	}

	const sources_meta = {
		upload: {
			icon: UploadIcon,
			label: i18n("Upload"),
			order: 0
		},
		webcam: {
			icon: WebcamIcon,
			label: i18n("Webcam"),
			order: 1
		},
		clipboard: {
			icon: ImagePaste,
			label: i18n("Paste"),
			order: 2
		}
	};

	$: sources_list = sources.sort(
		(a, b) => sources_meta[a].order - sources_meta[b].order
	);

	$: {
		if (sources.length === 1 && sources[0] === "webcam") {
			active_tool = "webcam";
		}
	}

	async function handle_toolbar(
		source: (typeof sources)[number]
	): Promise<void> {
		switch (source) {
			case "clipboard":
				navigator.clipboard.read().then(async (items) => {
					for (let i = 0; i < items.length; i++) {
						const type = items[i].types.find((t) => t.startsWith("image/"));
						if (type) {
							value = null;
							items[i].getType(type).then(async (blob) => {
								const f = await upload.load_files([
									new File([blob], `clipboard.${type.replace("image/", "")}`)
								]);
								f;
								value = f?.[0] || null;
							});
							break;
						}
					}
				});
				break;
			case "webcam":
				active_tool = "webcam";
				break;
			case "upload":
				upload.open_file_upload();
				break;
			default:
				break;
		}
	}
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />

<div data-testid="image" class="image-container">
	{#if value?.url}
		<ClearImage
			on:remove_image={() => {
				value = null;
				dispatch("clear");
			}}
		/>
	{/if}
	<div class="upload-container">
		<Upload
			hidden={value !== null || active_tool === "webcam"}
			bind:this={upload}
			bind:uploading
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			on:error
			{root}
			disable_click={!sources.includes("upload")}
		>
			{#if value === null && !active_tool}
				<slot />
			{/if}
		</Upload>
		{#if active_tool === "webcam"}
			<Webcam
				on:capture={(e) => handle_save(e.detail)}
				on:stream={(e) => handle_save(e.detail)}
				on:error
				on:drag
				on:upload={(e) => handle_save(e.detail)}
				{mirror_webcam}
				{streaming}
				mode="image"
				include_audio={false}
				{i18n}
			/>
		{:else if value !== null && !streaming}
			<!-- svelte-ignore a11y-click-events-have-key-events-->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions-->
			<img
				src={value.url}
				alt={value.alt_text}
				on:click={handle_click}
				class:selectable
			/>
		{/if}
	</div>
	{#if sources.length > 1 || sources.includes("clipboard")}
		<Toolbar show_border={!value?.url}>
			{#each sources_list as source}
				<IconButton
					on:click={() => handle_toolbar(source)}
					Icon={sources_meta[source].icon}
					size="large"
					label="{source}-image-toolbar-btn"
					padded={false}
				/>
			{/each}
		</Toolbar>
	{/if}
</div>

<style>
	/* .image-container {
		height: auto;
	} */
	img {
		width: var(--size-full);
		height: var(--size-full);
	}

	.upload-container {
		height: 100%;
		flex-shrink: 1;
		max-height: 100%;
	}

	.image-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height: 100%;
	}

	.selectable {
		cursor: crosshair;
	}
</style>
