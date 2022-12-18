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
	export let file_types: Array<string> = ["file"];

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

	let accept_file_types = "";
	try {
		file_types.forEach((type) => (accept_file_types += type + "/*, "));
	} catch (err) {
		if (err instanceof TypeError) {
			dispatch("error", "Please set file_types to a list.");
		} else {
			throw err;
		}
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
