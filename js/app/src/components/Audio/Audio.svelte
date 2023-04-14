<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { blobToBase64, FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { Audio, StaticAudio } from "@gradio/audio";
	import UploadText from "../UploadText.svelte";
	import { upload_files } from "@gradio/client";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: null | FileData = null;
	let old_value: null | FileData = null;

	export let mode: "static" | "dynamic";
	export let label: string;
	export let source: "microphone" | "upload";
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let style: Styles = {};
	export let streaming: boolean;

	export let loading_status: LoadingStatus;

	// TODO: Seems not used, delete it?
	export let name: string;
	export let pending: boolean;

	$: _value = normalise_file(value, root, root_url);

	let dragging = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		upload: undefined;
		stream: typeof value;
		error: string;
	}>();

	let pending_upload = false;
	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			console.log(value, old_value);
			old_value = value;
			if (_value === null) {
				dispatch("change");
				pending_upload = false;
			} else if (
				!(Array.isArray(_value) ? _value : [_value]).every(
					(file_data) => file_data.blob
				)
			) {
				pending_upload = false;
			} else if (mode === "dynamic") {
				let files = (Array.isArray(_value) ? _value : [_value]).map(
					(file_data) => file_data.blob!
				);

				let upload_value = _value;
				pending_upload = true;

				upload_files(root, files).then((response) => {
					if (upload_value !== _value) {
						// value has changed since upload started
						return;
					}

					pending_upload = false;
					if (response.error) {
						(async () => {
							_value.data = await blobToBase64(_value.blob!);
						})();
					} else {
						if (response.files) {
							_value.orig_name = _value.name;
							_value.name = response.files[0];
							_value.is_file = true;
						}

						_value = normalise_file(_value, root, root_url);
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
>
	<StatusTracker {...loading_status} />

	{#if mode === "dynamic"}
		<Audio
			{label}
			{show_label}
			value={_value}
			on:change={({ detail }) => {
				value = detail;
				dispatch("change");
			}}
			on:stream={({ detail }) => {
				value = detail;
				dispatch("stream", value);
			}}
			on:drag={({ detail }) => (dragging = detail)}
			{name}
			{source}
			{pending}
			{streaming}
			on:edit
			on:play
			on:pause
			on:ended
			on:upload
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				loading_status.message = detail;
			}}
		>
			<UploadText type="audio" />
		</Audio>
	{:else}
		<StaticAudio
			{show_label}
			value={_value}
			name={_value?.name || "audio_file"}
			{label}
		/>
	{/if}
</Block>
