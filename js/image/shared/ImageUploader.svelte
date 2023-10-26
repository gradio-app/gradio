<script lang="ts">
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Sketch as SketchIcon } from "@gradio/icons";
	import type { SelectData, I18nFormatter } from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";
	import {
		Webcam as WebcamIcon,
		ImagePaste,
		Upload as UploadIcon
	} from "@gradio/icons";
	import Webcam from "./Webcam.svelte";
	import { Toolbar, IconButton } from "@gradio/atoms";

	import {
		Upload,
		ModifyUpload,
		type FileData,
		normalise_file
	} from "@gradio/upload";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let sources: ("paste" | "webcam" | "upload")[] = [
		"upload",
		"paste",
		"webcam"
	];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let selectable = false;
	export let root: string;
	export let i18n: I18nFormatter;
	let _value: null | FileData = null;

	let upload: Upload;
	export let active_tool: "webcam" | null = null;
	function handle_upload({ detail }: CustomEvent<string>): void {
		value = normalise_file(detail, root, null);

		// dispatch("upload", normalise_file(detail, root, null));
	}

	function handle_clear({ detail }: CustomEvent<null>): void {
		value = null;
		dispatch("clear");
	}

	async function handle_save(img_blob, initial): Promise<void> {
		// console.log(img);
		const f = await upload.load_files([new File([img_blob], `webcam.png`)]);

		value = f?.[0] || null;
		active_tool = null;
		// value = detail;

		await tick();

		dispatch(streaming ? "stream" : "change");
	}

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

	let img_height = 0;
	let img_width = 0;
	let container_height = 0;

	let mode;

	let max_height;
	let max_width;

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	}

	const sort_order = {
		upload: 0,
		webcam: 1,
		paste: 2
	};

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
		paste: {
			icon: ImagePaste,
			label: i18n("Paste"),
			order: 2
		}
	};

	$: sources_list = sources.sort(
		(a, b) => sources_meta[a].order - sources_meta[b].order
	);

	$: console.log({ sources, sources_list });

	async function handle_toolbar(
		source: (typeof sources)[number]
	): Promise<void> {
		console.log(source);
		switch (source) {
			case "clipboard":
				navigator.clipboard.read().then(async (items) => {
					for (let i = 0; i < items.length; i++) {
						// Do something with the most recent item
						const type = items[i].types.find((t) => t.startsWith("image/"));
						console.log({ type, item_types: items[i].types });
						if (type) {
							items[i].getType(type).then(async (blob) => {
								const f = await upload.load_files([
									new File([blob], `clipboard.${type.replace("image/", "")}`)
								]);
								f;
								value = f?.[0] || null;
								console.log({ f, value });
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

<div
	data-testid="image"
	class="image-container"
	bind:offsetHeight={max_height}
	bind:offsetWidth={max_width}
>
	<!-- {#if source === "upload"} -->
	<div class="upload-container">
		<Upload
			bind:this={upload}
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			on:error
			disable_click={!!value || active_tool === "webcam"}
			{root}
		>
			{#if value === null || streaming}
				{#if active_tool === "webcam"}
					<Webcam
						on:capture={(e) => handle_save(e.detail)}
						on:clear={handle_clear}
						on:stream={handle_save}
						on:error
						on:drag
						on:upload={handle_upload}
						on:select={({ detail }) => dispatch("select", detail)}
						on:edit={() => (active_tool = null)}
						{mirror_webcam}
						{streaming}
						mode="image"
						include_audio={false}
						{i18n}
					/>
				{:else}
					<slot />
				{/if}
			{:else}
				<img src={value.url} alt="" />
			{/if}
		</Upload>
	</div>
	<Toolbar>
		{#each sources as source}
			<IconButton
				on:click={() => handle_toolbar(source)}
				Icon={sources_meta[source].icon}
				size="large"
				padded={false}
			/>
		{/each}
	</Toolbar>
</div>

<style>
	/* .image-container {
		height: auto;
	} */
	img {
		object-fit: contain;
		/* position: absolute; */
		top: 0;
		width: var(--size-full);
		height: var(--size-full);
	}

	/* .selectable {
		cursor: crosshair;
	}

	.absolute-img {
		position: absolute;
		opacity: 0;
	}

	.webcam {
		transform: scaleX(-1);
	} */

	.upload-container {
		height: 100%;
		flex-shrink: 3;
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
</style>
