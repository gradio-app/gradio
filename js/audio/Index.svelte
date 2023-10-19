<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker";

	import StaticAudio from "./static/StaticAudio.svelte";
	import InteractiveAudio from "./interactive/InteractiveAudio.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, UploadText } from "@gradio/atoms";

	import { normalise_file } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let mode: "static" | "interactive";
	export let value: null | FileData | string = null;
	export let source: "microphone" | "upload";
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let root_url: null | string;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let autoplay = false;
	export let show_download_button = true;
	export let show_share_button = false;

	export let name: string;
	export let pending: boolean;
	export let streaming: boolean;
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
		pause_recording: never; // TODO: add to docs
		stop_recording: never;
		upload: never;
		clear: never;
		share: ShareData;
	}>;

	// waveform settings
	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";

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

{#if mode === "static"}
	<Block
		variant={"solid"}
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

		<StaticAudio
			i18n={gradio.i18n}
			{autoplay}
			{show_label}
			{show_download_button}
			{show_share_button}
			value={_value}
			name={_value?.name || "audio_file"}
			{label}
			{waveformColor}
			{waveformProgressColor}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
		/>
	</Block>
{:else}
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
		<InteractiveAudio
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
			on:pause_recording={() => gradio.dispatch("pause_recording")}
			on:stop_recording={() => gradio.dispatch("stop_recording")}
			on:upload={() => gradio.dispatch("upload")}
			on:clear={() => gradio.dispatch("clear")}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			i18n={gradio.i18n}
			{waveformColor}
			{waveformProgressColor}
		>
			<UploadText i18n={gradio.i18n} type="audio" />
		</InteractiveAudio>
	</Block>
{/if}
