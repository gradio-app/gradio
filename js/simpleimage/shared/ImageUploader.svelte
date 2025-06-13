<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image as ImageIcon } from "@gradio/icons";

	import { Upload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";

	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let root: string;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];

	let upload_component: Upload;
	let uploading = false;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		value = detail;
		dispatch("upload");
	}
	$: if (uploading) value = null;

	const dispatch = createEventDispatcher<{
		change?: never;
		clear?: never;
		drag: boolean;
		upload?: never;
	}>();

	let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={ImageIcon} label={label || "Image"} />

<div data-testid="image" class="image-container">
	{#if value?.url}
		<ClearImage
			on:remove_image={() => {
				value = null;
				dispatch("clear");
			}}
		/>
	{/if}
	<div class="upload-container">
		<Upload
			{upload}
			{stream_handler}
			hidden={value !== null}
			bind:this={upload_component}
			bind:uploading
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			on:error
			{root}
		>
			{#if value === null}
				<slot />
			{/if}
		</Upload>
		{#if value !== null}
			<div class="image-frame">
				<img src={value.url} alt={value.alt_text} />
			</div>
		{/if}
	</div>
</div>

<style>
	.image-frame :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: scale-down;
	}

	.image-frame {
		width: 100%;
		height: 100%;
	}

	.upload-container {
		height: 100%;
		flex-shrink: 1;
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
