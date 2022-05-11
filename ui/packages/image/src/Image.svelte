<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Sketch as SketchIcon } from "@gradio/icons";

	import Cropper from "./Cropper.svelte";
	import Sketch from "./Sketch.svelte";
	import Webcam from "./Webcam.svelte";
	import ModifySketch from "./ModifySketch.svelte";
	import ImageEditor from "./ImageEditor.svelte";

	import { Upload, ModifyUpload } from "@gradio/upload";

	export let value: null | string;
	export let label: string | undefined = undefined;
	export let style: Record<string, string> = {};
	export let show_label: boolean;

	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";

	export let drop_text: string = "Drop an image file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";

	let mode: "edit" | "view" = "view";
	let sketch: Sketch;

	function handle_upload({ detail }: CustomEvent<string>) {
		value = detail;
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		dispatch("clear");
	}

	function handle_save({ detail }: { detail: string }) {
		value = detail;
		mode = "view";
		dispatch("edit");
	}

	const dispatch = createEventDispatcher<{
		change: string | null;
		edit: undefined;
		clear: undefined;
		drag: boolean;
	}>();

	$: dispatch("change", value);

	let dragging = false;

	$: dispatch("drag", dragging);
</script>

<BlockLabel
	{show_label}
	Icon={source === "canvas" ? SketchIcon : Image}
	label={label || (source === "canvas" ? "Sketch" : "Image")}
/>

<div class:bg-gray-200={value} class:h-60={source !== "webcam"}>
	{#if source === "canvas"}
		<ModifySketch
			on:undo={() => sketch.undo()}
			on:clear={() => sketch.clear()}
		/>
		<Sketch {value} bind:this={sketch} on:change={handle_save} />
	{:else if value === null}
		{#if source === "upload"}
			<Upload
				bind:dragging
				filetype="image/x-png,image/gif,image/jpeg"
				on:load={handle_upload}
				include_file_metadata={false}
				style={style["upload"]}
			>
				<div class="flex flex-col">
					{drop_text}
					<span class="text-gray-300">- {or_text} -</span>
					{upload_text}
				</div>
			</Upload>
		{:else if source === "webcam"}
			<Webcam on:capture={handle_save} />
		{/if}
	{:else if tool === "select"}
		<Cropper image={value} on:crop={handle_save} />
	{:else if tool === "editor"}
		{#if mode === "edit"}
			<ImageEditor
				{value}
				on:cancel={() => (mode = "view")}
				on:save={handle_save}
			/>
		{/if}
		<ModifyUpload
			on:edit={() => (mode = "edit")}
			on:clear={handle_clear}
			editable
			{style}
		/>

		<img class="w-full h-full object-contain" src={value} {style} alt="" />
	{:else}
		<img class="w-full h-full object-contain" src={value} {style} alt="" />
	{/if}
</div>

<style lang="postcss">
	:global(.image_editor_buttons) {
		width: 800px;
		@apply flex justify-end gap-1;
	}
	:global(.image_editor_buttons button) {
		@apply px-2 py-1 text-xl bg-black text-white font-semibold rounded-t;
	}
	:global(.tui-image-editor-header-buttons) {
		@apply hidden;
	}
	:global(.tui-colorpicker-palette-button) {
		width: 12px;
		height: 12px;
	}
</style>
