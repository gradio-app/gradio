<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { blobToBase64, FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { Video, StaticVideo } from "@gradio/video";
	import UploadText from "../UploadText.svelte";
	import { upload_files } from "@gradio/client";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: null | [FileData, FileData | null] = null;
	let old_value: null | [FileData, FileData | null] = null;

	export let mode: "static" | "dynamic";
	export let label: string;
	export let source: string;
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let style: Styles = {};
	export let mirror_webcam: boolean;
	export let include_audio: boolean;

	export let loading_status: LoadingStatus;

	let _video: null | FileData = null;
	let _subtitle: null | FileData = null;

	let dragging = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		upload: undefined;
	}>();

	function handle_change({ detail }: CustomEvent<FileData | null>) {
		if (detail != null) {
			value = [detail, null] as [FileData, FileData | null];
		} else {
			value = null;
		}

		dispatch("change");
	}

	$: {
		if (value != null) {
			_video = normalise_file(value[0], root, root_url);
			_subtitle = normalise_file(value[1], root, root_url);
		} else {
			_video = null;
			_subtitle = null;
		}
	}

	let pending_upload = false;
	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			if (_video === null) {
				dispatch("change");
				pending_upload = false;
			} else if (
				!(Array.isArray(_video) ? _video : [_video]).every(
					(file_data) => file_data.blob
				)
			) {
				pending_upload = false;
			} else if (mode === "dynamic") {
				let files = (Array.isArray(_video) ? _video : [_video]).map(
					(file_data) => file_data.blob!
				);

				let upload_value = _video;
				pending_upload = true;

				upload_files(root, files).then((response) => {
					if (upload_value !== _video) {
						// value has changed since upload started
						return;
					}

					pending_upload = false;
					if (response.error) {
						(async () => {
							_video.data = await blobToBase64(_video.blob!);
						})();
					} else {
						if (response.files) {
							_video.orig_name = _video.name;
							_video.name = response.files[0];
							_video.is_file = true;
						}

						_video = normalise_file(_video, root, root_url);
					}
					dispatch("change");
					dispatch("upload");
				});
			}
		}
	}
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	style={{ height: style.height, width: style.width }}
	allow_overflow={false}
>
	<StatusTracker {...loading_status} />

	{#if mode === "static"}
		<StaticVideo
			value={_video}
			subtitle={_subtitle}
			{label}
			{show_label}
			on:play
			on:pause
		/>
	{:else}
		<Video
			value={_video}
			subtitle={_subtitle}
			on:change={handle_change}
			on:drag={({ detail }) => (dragging = detail)}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				loading_status.message = detail;
			}}
			{label}
			{show_label}
			{source}
			{mirror_webcam}
			{include_audio}
			on:clear
			on:play
			on:pause
			on:upload
		>
			<UploadText type="video" />
		</Video>
	{/if}
</Block>
