<script lang="ts">
	import type { Snippet } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image as ImageIcon } from "@gradio/icons";

	import { Upload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";

	let {
		value = $bindable(),
		label = undefined,
		show_label,
		root,
		upload,
		stream_handler,
		onclear,
		ondrag,
		onupload,
		onerror,
		children
	}: {
		value: null | FileData;
		label?: string | undefined;
		show_label: boolean;
		root: string;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: () => void;
		onerror?: (error: string) => void;
		children?: Snippet;
	} = $props();

	let upload_component: any = $state();
	let uploading = $state(false);

	function handle_upload(detail: FileData): void {
		value = detail;
		onupload?.();
	}

	$effect(() => {
		if (uploading) value = null;
	});

	let dragging = $state(false);

	$effect(() => {
		ondrag?.(dragging);
	});
</script>

<BlockLabel {show_label} Icon={ImageIcon} label={label || "Image"} />

<div data-testid="image" class="image-container">
	{#if value?.url}
		<ClearImage
			onremove_image={() => {
				value = null;
				onclear?.();
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
			onload={handle_upload}
			onerror={(e) => onerror?.(e)}
			{root}
		>
			{#if value === null}
				{@render children?.()}
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
