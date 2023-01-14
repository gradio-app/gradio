<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import FilePreview from "./FilePreview.svelte";

	export let value: null | FileData | Array<FileData>;

	export let label: string;
	export let show_label: boolean = true;
	export let file_count: string = "single";
	export let file_types: string[] | null = null;

	async function handle_upload({ detail }: CustomEvent<FileData>) {
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
		change: FileData | null;
		clear: undefined;
		drag: boolean;
		upload: FileData;
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

{#if value === null}
	<Upload
		on:load={handle_upload}
		filetype={accept_file_types}
		{file_count}
		bind:dragging
	>
		<slot />
	</Upload>
{:else}
	<ModifyUpload on:clear={handle_clear} absolute />
	<FilePreview {value} />
{/if}
