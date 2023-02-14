<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { BinaryFileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import FilePreview from "./FilePreview.svelte";

	export let value: null | BinaryFileData | Array<BinaryFileData>;

	export let label: string;
	export let show_label: boolean = true;
	export let file_count: string = "single";
	export let file_types: string[] | null = null;

	async function handle_upload({
		detail
	}: CustomEvent<BinaryFileData | Array<BinaryFileData>>) {
		value = detail;
		await tick();
		dispatch("change", value);
		dispatch("upload", detail);
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		dispatch("change", value);
		dispatch("clear");
	}

	const dispatch = createEventDispatcher<{
		change: Array<BinaryFileData> | BinaryFileData | null;
		clear: undefined;
		drag: boolean;
		upload: Array<BinaryFileData> | BinaryFileData;
		error: string;
	}>();

	let accept_file_types: string | null;
	if (file_types == null) {
		accept_file_types = null;
	} else {
		file_types = file_types.map((x) => {
			if (x.startsWith(".")) {
				return x;
			} else {
				return x + "/*";
			}
		});
		accept_file_types = file_types.join(", ");
	}

	let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} label={label || "File"} />

{#if value}
	<ModifyUpload on:clear={handle_clear} absolute />
	<FilePreview {value} />
{:else}
	<Upload
		on:load={handle_upload}
		filetype={accept_file_types}
		parse_to_data_url={false}
		{file_count}
		bind:dragging
	>
		<slot />
	</Upload>
{/if}
