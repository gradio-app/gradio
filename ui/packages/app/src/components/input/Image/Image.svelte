<script lang="ts">
	import Cropper from "../../utils/Cropper.svelte";

	import Upload from "../../utils/Upload.svelte";
	import ModifyUpload from "../../utils/ModifyUpload.svelte";
	import ModifySketch from "../../utils/ModifySketch.svelte";
	import ImageEditor from "../../utils/ImageEditor.svelte";
	import Sketch from "../../utils/Sketch.svelte";
	import Webcam from "../../utils/Webcam.svelte";
	import { _ } from "svelte-i18n";
	export let value: null | string;
	export let setValue: (val: typeof value) => typeof value;
	export let theme: string;
	export let static_src: string;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";

	let mode: "edit" | "view" = "view";
	let sketch: Sketch;

	interface FileData {
		name: string;
		size: number;
		data: string;
		is_example: false;
	}

	function handle_save({ detail }: { detail: string }) {
		setValue(detail);
		mode = "view";
	}

	function handle_load(val: string | FileData | (string | FileData)[] | null) {
		setValue(val as string);
		return val;
	}
</script>

<div class="input-image">
	<div
		class="image-preview w-full h-60 flex justify-center items-center dark:bg-gray-600 relative"
		class:bg-gray-200={value}
		class:h-60={source !== "webcam"}
	>
		{#if source === "canvas"}
			<ModifySketch
				on:undo={() => sketch.undo()}
				on:clear={() => sketch.clear()}
				{static_src}
			/>
			<Sketch
				{value}
				bind:this={sketch}
				on:change={({ detail }) => setValue(detail)}
			/>
		{:else if value === null}
			{#if source === "upload"}
				<Upload
					filetype="image/x-png,image/gif,image/jpeg"
					load={handle_load}
					include_file_metadata={false}
					{theme}
				>
					{$_("interface.drop_image")}
					<br />- {$_("interface.or")} -<br />
					{$_("interface.click_to_upload")}
				</Upload>
			{:else if source === "webcam"}
				<Webcam
					mode="image"
					on:capture={({ detail }) => setValue(detail)}
					{static_src}
				/>
			{/if}
		{:else if tool === "select"}
			<Cropper image={value} on:crop={({ detail }) => setValue(detail)} />
		{:else if tool === "editor"}
			{#if mode === "edit"}
				<ImageEditor
					{value}
					on:cancel={() => (mode = "view")}
					on:save={handle_save}
				/>
			{/if}
			<ModifyUpload
				edit={() => (mode = "edit")}
				clear={() => setValue(null)}
				{theme}
				{static_src}
			/>

			<img class="w-full h-full object-contain" src={value} alt="" />
		{:else}
			<img class="w-full h-full object-contain" src={value} alt="" />
		{/if}
	</div>
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
