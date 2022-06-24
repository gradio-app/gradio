<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Sketch as SketchIcon } from "@gradio/icons";

	import Cropper from "./Cropper.svelte";
	import Sketch from "./Sketch.svelte";
	import Webcam from "./Webcam.svelte";
	import ModifySketch from "./ModifySketch.svelte";

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

	let sketch: Sketch;

	if (
		value &&
		(source === "canvas" || source === "webcam") &&
		tool === "sketch"
	) {
		value = { image: value, mask: null };
	}

	function handle_upload({ detail }: CustomEvent<string>) {
		value =
			(source === "upload" || source === "webcam") && tool === "sketch"
				? { image: detail, mask: null }
				: detail;
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		dispatch("clear");
	}

	async function handle_save({ detail }: { detail: string }) {
		value =
			(source === "upload" || source === "webcam") && tool === "sketch"
				? { image: detail, mask: null }
				: detail;

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

	$: dispatch("change", value);

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_image_load(event: Event) {
		const element = event.composedPath()[0] as HTMLImageElement;
		img_width = element.naturalWidth;
		img_height = element.naturalHeight;
	}

	function handle_mask_save({ detail }: { detail: string }) {
		value = {
			image: typeof value === "string" ? value : value?.image || null,
			mask: detail
		};
	}

	async function handle_mask_clear() {
		sketch.clear();
		await tick();
		value = null;
	}

	let img_height = 0;
	let img_width = 0;
</script>

<BlockLabel
	{show_label}
	Icon={source === "canvas" ? SketchIcon : Image}
	label={label || (source === "canvas" ? "Sketch" : "Image")}
/>

<div
	class:bg-gray-200={value}
	class:h-60={source !== "webcam" || tool === "sketch"}
>
	{#if source === "canvas"}
		<ModifySketch
			on:undo={() => sketch.undo()}
			on:clear={() => sketch.clear()}
		/>
		<Sketch {value} bind:this={sketch} on:change={handle_save} />
	{:else if value === null || streaming}
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

		<img class="w-full h-full object-contain" src={value} alt="" />
	{:else if tool === "sketch" && value !== null}
		<img
			class="absolute w-full h-full object-contain"
			src={value.image}
			alt=""
			on:load={handle_image_load}
		/>
		{#if img_width > 0}
			<Sketch
				{value}
				bind:this={sketch}
				brush_radius={25}
				brush_color="rgba(255, 255, 255, 0.65)"
				on:change={handle_mask_save}
				mode="mask"
				width={img_width}
				height={img_height}
			/>
			<ModifySketch
				on:undo={() => sketch.undo()}
				on:clear={handle_mask_clear}
			/>
		{/if}
	{:else}
		<img class="w-full h-full object-contain" src={value} alt="" />
	{/if}
</div>
