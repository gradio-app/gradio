<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";

	import { prettyBytes } from "./utils";
	import file_icon from "./file.svg";

	export let value: null | FileData;

	export let drop_text: string = "Drop a file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";
	export let label: string = "";
	export let style: string;

	let file_count: string;

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		dispatch("change", value);
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
	}>();

	function truncate(str: string): string {
		if (str.length > 30) {
			return `${str.substr(0, 30)}...`;
		} else return str;
	}

	let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel image={file_icon} label={label || "File"} />

{#if value === null}
	<Upload on:load={handle_upload} filetype="file" bind:dragging>
		{drop_text}
		<br />- {or_text} -<br />
		{upload_text}
	</Upload>
{:else}
	<div
		class="file-preview w-full flex flex-row justify-between overflow-y-auto mt-7"
	>
		<ModifyUpload on:clear={handle_clear} absolute />

		<div class="file-name p-2">
			{truncate(value.name)}
		</div>
		<div class="file-size  p-2">
			{prettyBytes(value.size || 0)}
		</div>
		<div class="file-size p-2 hover:underline">
			<a href={value.data} download class="text-indigo-600 hover:underline"
				>Download</a
			>
		</div>
	</div>
{/if}
