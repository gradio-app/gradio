<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio } from "@gradio/utils";

	import { UploadText } from "@gradio/atoms";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker";

	import Audio from "./Audio.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	import { normalise_file } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData | string = null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let pending: boolean;
	export let streaming: boolean;
	export let root_url: null | string;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let autoplay = false;
	export let show_edit_button = true;
	export let gradio: Gradio<{
		change: typeof value;
		stream: typeof value;
		error: string;
		edit: never;
		play: never;
		pause: never;
		stop: never;
		end: never;
		start_recording: never;
		stop_recording: never;
		upload: never;
		clear: never;
	}>;

	let old_value: null | FileData | string = null;

	let _value: null | FileData;
	$: _value = normalise_file(value, root, root_url);

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	let dragging: boolean;
</script>

<Block
	variant={value === null && source === "upload" ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{visible}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	<Audio
		{label}
		{show_label}
		value={_value}
		on:change={({ detail }) => (value = detail)}
		on:stream={({ detail }) => {
			value = detail;
			gradio.dispatch("stream", value);
		}}
		on:drag={({ detail }) => (dragging = detail)}
		{name}
		{root}
		{source}
		{pending}
		{streaming}
		{autoplay}
		{show_edit_button}
		on:edit={() => gradio.dispatch("edit")}
		on:play={() => gradio.dispatch("play")}
		on:pause={() => gradio.dispatch("pause")}
		on:stop={() => gradio.dispatch("stop")}
		on:end={() => gradio.dispatch("end")}
		on:start_recording={() => gradio.dispatch("start_recording")}
		on:stop_recording={() => gradio.dispatch("stop_recording")}
		on:upload={() => gradio.dispatch("upload")}
		on:clear={() => gradio.dispatch("clear")}
		on:error={({ detail }) => {
			loading_status = loading_status || {};
			loading_status.status = "error";
			gradio.dispatch("error", detail);
		}}
		i18n={gradio.i18n}
	>
		<UploadText i18n={gradio.i18n} type="audio" />
	</Audio>
</Block>
