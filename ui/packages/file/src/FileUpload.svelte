<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { Block, BlockLabel } from "@gradio/atoms";

	import { prettyBytes } from "./utils";
	import file_icon from "./file.svg";

	export let value: null | FileData;

	export let drop_text: string = "Drop a file file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";
	export let label: string = "";
	let file_count: string;

	function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		dispatch("clear");
	}

	const dispatch =
		createEventDispatcher<{ change: FileData | null; clear: undefined }>();

	$: dispatch("change", value);
	let dragging = false;
</script>

<Block
	variant={value === null ? "dashed" : "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<BlockLabel image={file_icon} label={label || "File"} />

	{#if value === null}
		<Upload on:load={handle_upload} filetype="file" bind:dragging>
			{drop_text}
			<br />- {or_text} -<br />
			{upload_text}
		</Upload>
	{:else}
		<div
			class="file-preview w-full flex flex-row flex-wrap justify-center items-center relative overflow-y-auto"
		>
			<ModifyUpload on:clear={handle_clear} />

			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-10 w-1/5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<div class="file-name w-3/5 text-4xl p-6 break-all">{value.name}</div>
			<div class="file-size text-2xl p-2">
				{prettyBytes(value.size || 0)}
			</div>
			{#if file_count === "single" && value.size}
				<div class="file-size text-2xl p-2">
					{prettyBytes(value.size)}
				</div>
			{/if}
		</div>
	{/if}
</Block>
