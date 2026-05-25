<script lang="ts">
	import { Block, IconButton, UploadText } from "@gradio/atoms";
	import { Clear } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";
	import { Upload } from "@gradio/upload";
	import { type Client, type FileData, prepare_files } from "@gradio/client";
	import VideoEditor from "./shared/VideoEditor.svelte";
	import type {
		VideoEditorData,
		VideoEditorProps,
		VideoEditorEvents
	} from "./types";

	const props = $props();

	class VideoEditorGradio extends Gradio<VideoEditorEvents, VideoEditorProps> {
		async get_data() {
			const data = (await super.get_data()) as any;
			if (!data?.value) return data;

			const mask = await upload_mask(this.shared.client, this.shared.root);
			if (!mask) return data;

			return { ...data, value: { ...data.value, mask } };
		}
	}

	async function upload_mask(
		client: Client,
		root: string
	): Promise<FileData | null> {
		const blob = await editor?.get_mask_blob();
		if (!blob) return null;
		const file = new File([blob], "mask.png", { type: "image/png" });
		const prepared = await prepare_files([file]);
		const uploaded = await client.upload(prepared, root);
		return uploaded?.[0] ?? null;
	}

	const gradio = new VideoEditorGradio(props);

	let video_src = $derived<string | null>(
		gradio.props.value?.video?.url ?? null
	);
	let editor: VideoEditor;
	let uploading = $state(false);

	function handle_upload(file_data: FileData): void {
		gradio.props.value = { video: file_data } as VideoEditorData;
		gradio.dispatch("upload");
		gradio.dispatch("change");
	}

	function handle_remove(): void {
		gradio.props.value = null;
		gradio.dispatch("clear");
		gradio.dispatch("change");
	}
</script>

<Block
	variant="panel"
	border_mode="base"
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	height={gradio.props.height}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>

	{#if !video_src}
		{#if gradio.shared.interactive}
			<Upload
				filetype="video/*"
				root={gradio.shared.root}
				upload={(...args) => gradio.shared.client.upload(...args)}
				stream_handler={(...args) => gradio.shared.client.stream(...args)}
				bind:uploading
				onload={(data) => handle_upload(data as FileData)}
			>
				<UploadText i18n={gradio.i18n} type="video" />
			</Upload>
		{:else}
			<div class="empty">No video</div>
		{/if}
	{:else}
		<div class="editor-wrap">
			{#if gradio.shared.interactive}
				<div class="remove-wrap">
					<IconButton
						Icon={Clear}
						label="Remove video"
						onclick={handle_remove}
					/>
				</div>
			{/if}
			<VideoEditor
				bind:this={editor}
				src={video_src}
				brush_color={gradio.props.brush_color}
				brush_size={gradio.props.brush_size}
				interactive={gradio.shared.interactive}
			/>
		</div>
	{/if}
</Block>

<style>
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--size-40);
		color: var(--body-text-color-subdued);
	}
	.editor-wrap {
		position: relative;
	}
	.remove-wrap {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		z-index: var(--layer-top);
	}
</style>
