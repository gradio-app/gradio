<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as FilePreview } from "./shared/FilePreview.svelte";
	export { default as BaseFileUpload } from "./shared/FileUpload.svelte";
	export { default as BaseFile } from "./shared/File.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import File from "./shared/File.svelte";
	import FileUpload from "./shared/FileUpload.svelte";
	import { Block, UploadText } from "@gradio/atoms";
	import type { FileEvents, FileProps } from "./types";
	import { StatusTracker } from "@gradio/statustracker";
	import { tick } from "svelte";

	const props = $props();
	let upload_promise = $state<Promise<any>>();

	let dragging = $state(false);
	let pending_upload = $state(false);

	class FileGradio extends Gradio<FileEvents, FileProps> {
		async get_data() {
			if (upload_promise) {
				await upload_promise;
				await tick();
			}
			const data = await super.get_data();

			return data;
		}
	}

	const gradio = new FileGradio(props);

	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change", $state.snapshot(gradio.props.value));
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	variant={gradio.props.value ? "solid" : "dashed"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		status={pending_upload
			? "generating"
			: gradio.shared.loading_status?.status || "complete"}
<<<<<<< HEAD
		on:clear_status={() =>
=======
		on_clear_status={() =>
>>>>>>> main
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	{#if !gradio.shared.interactive}
		<File
			on_select={({ detail }) => gradio.dispatch("select", detail)}
			on_download={({ detail }) => gradio.dispatch("download", detail)}
			selectable={gradio.props._selectable}
			value={gradio.props.value}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			height={gradio.props.height}
			i18n={gradio.i18n}
		/>
	{:else}
		<FileUpload
			bind:upload_promise
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			value={gradio.props.value}
			file_count={gradio.props.file_count}
			file_types={gradio.props.file_types}
			selectable={gradio.props._selectable}
			height={gradio.props.height}
			root={gradio.shared.root}
			allow_reordering={gradio.props.allow_reordering}
			max_file_size={gradio.shared.max_file_size}
			on:change={({ detail }) => {
				gradio.props.value = detail;
			}}
			on:drag={({ detail }) => (dragging = detail)}
			on:clear={() => gradio.dispatch("clear")}
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:error={({ detail }) => {
				gradio.shared.loading_status = gradio.shared.loading_status || {};
				gradio.shared.loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:delete={({ detail }) => {
				gradio.dispatch("delete", detail);
			}}
			i18n={gradio.i18n}
		>
			<UploadText i18n={gradio.i18n} type="file" />
		</FileUpload>
	{/if}
</Block>
