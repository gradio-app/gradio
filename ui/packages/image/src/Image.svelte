<script lang="ts">
	// @ts-nocheck
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Sketch as SketchIcon } from "@gradio/icons";

	import Cropper from "./Cropper.svelte";
	import Sketch from "./Sketch.svelte";
	import Webcam from "./Webcam.svelte";
	import ModifySketch from "./ModifySketch.svelte";
	import SketchSettings from "./SketchSettings.svelte";

	import { Upload, ModifyUpload } from "@gradio/upload";

	export let value:
		| null
		| string
		| { image: string | null; mask: string | null };
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" | "sketch" = "editor";

	export let drop_text: string = "Drop an image file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";
	export let streaming: boolean = false;
	export let pending: boolean = false;
	export let mirror_webcam: boolean;

	let sketch: Sketch;

	if (
		value &&
		(source === "upload" || source === "webcam") &&
		tool === "sketch"
	) {
		value = { image: value as string, mask: null };
	}

	function handle_upload({ detail }: CustomEvent<string>) {
		if (tool === "color-sketch") {
			static_image = detail;
		} else {
			value =
				(source === "upload" || source === "webcam") && tool === "sketch"
					? { image: detail, mask: null }
					: detail;
		}
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		dispatch("clear");
	}

	async function handle_save({ detail }: { detail: string }) {
		if (tool === "color-sketch") {
			value = { image: detail, mask: null };
		} else if (mode === "mask") {
			value = {
				image: typeof value === "string" ? value : value?.image || null,
				mask: detail
			};
		} else if (
			(source === "upload" || source === "webcam") &&
			tool === "sketch"
		) {
			value = { image: detail, mask: null };
		} else {
			value = detail;
		}

		await tick();

		dispatch(streaming ? "stream" : "edit");
	}

	const dispatch = createEventDispatcher<{
		change: string | null;
		stream: string | null;
		edit: undefined;
		clear: undefined;
		drag: boolean;
	}>();

	$: dispatch("change", value as string);

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_image_load(event: Event) {
		const element = event.composedPath()[0] as HTMLImageElement;
		img_width = element.naturalWidth;
		img_height = element.naturalHeight;
		container_height = element.getBoundingClientRect().height;
	}

	async function handle_mask_clear() {
		sketch.clear();
		await tick();
		value = null;
	}

	let img_height = 0;
	let img_width = 0;
	let container_height = 0;

	let brush_radius = 20;

	let mode;

	$: {
		if (source === "canvas" && tool === "sketch") {
			mode = "bw-sketch";
		} else if (tool === "color-sketch") {
			mode = "color-sketch";
		} else if (source === "upload" && tool === "sketch") {
			mode = "mask";
		} else {
			mode = "editor";
		}
	}

	$: brush_color = mode == "mask" ? "#000000A6" : "#000";

	let value_img;
	let max_height;
	let max_width;

	let static_image = undefined;
</script>

<BlockLabel
	{show_label}
	Icon={source === "canvas" ? SketchIcon : Image}
	label={label || (source === "canvas" ? "Sketch" : "Image")}
/>

<div
	class:bg-gray-200={value}
	class:h-60={source !== "webcam" ||
		tool === "sketch" ||
		tool === "color-sketch"}
	data-testid="image"
	bind:offsetHeight={max_height}
	bind:offsetWidth={max_width}
>
	{#if source === "canvas"}
		<ModifySketch
			on:undo={() => sketch.undo()}
			on:clear={() => sketch.clear()}
		/>
		{#if tool === "color-sketch"}
			<SketchSettings
				bind:brush_radius
				bind:brush_color
				container_height={container_height || max_height}
				img_width={img_width || max_width}
				img_height={img_height || max_height}
			/>
		{/if}
		<Sketch
			{value}
			bind:brush_radius
			bind:brush_color
			bind:this={sketch}
			on:change={handle_save}
			{mode}
			width={img_width || max_width}
			height={img_height || max_height}
			container_height={container_height || max_height}
		/>
	{:else if (value === null && !static_image) || streaming}
		{#if source === "upload"}
			<Upload
				bind:dragging
				filetype="image/x-png,image/gif,image/jpeg"
				on:load={handle_upload}
				include_file_metadata={false}
			>
				<div class="flex flex-col">
					{drop_text}
					<span class="text-gray-300">- {or_text} -</span>
					{upload_text}
				</div>
			</Upload>
		{:else if source === "webcam"}
			<Webcam
				on:capture={handle_save}
				on:stream={handle_save}
				{streaming}
				{pending}
				{mirror_webcam}
			/>
		{/if}
	{:else if tool === "select"}
		<Cropper image={value} on:crop={handle_save} />
		<ModifyUpload on:clear={(e) => (handle_clear(e), (tool = "editor"))} />
	{:else if tool === "editor"}
		<ModifyUpload
			on:edit={() => (tool = "select")}
			on:clear={handle_clear}
			editable
		/>

		<img
			class="w-full h-full object-contain"
			src={value}
			alt=""
			class:scale-x-[-1]={source === "webcam" && mirror_webcam}
		/>
	{:else if (tool === "sketch" || tool === "color-sketch") && (value !== null || static_image)}
		{#key static_image || value}
			<img
				bind:this={value_img}
				class="absolute w-full h-full object-contain"
				src={static_image || value?.image || value}
				alt=""
				on:load={handle_image_load}
				class:scale-x-[-1]={source === "webcam" && mirror_webcam}
			/>
		{/key}
		{#if img_width > 0}
			<Sketch
				{value}
				bind:this={sketch}
				bind:brush_radius
				bind:brush_color
				on:change={handle_save}
				{mode}
				width={img_width || max_width}
				height={img_height || max_height}
				container_height={container_height || max_height}
				{value_img}
			/>
			<ModifySketch
				on:undo={() => sketch.undo()}
				on:clear={handle_mask_clear}
			/>
			{#if tool === "color-sketch"}
				<SketchSettings
					bind:brush_radius
					bind:brush_color
					container_height={container_height || max_height}
					img_width={img_width || max_width}
					img_height={img_height || max_height}
				/>
			{/if}
		{/if}
	{:else}
		<img
			class="w-full h-full object-contain"
			src={value.image || value}
			alt=""
			class:scale-x-[-1]={source === "webcam" && mirror_webcam}
		/>
	{/if}
</div>
