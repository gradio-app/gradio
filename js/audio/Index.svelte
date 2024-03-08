<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import type { FileData } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	import StaticAudio from "./static/StaticAudio.svelte";
	import InteractiveAudio from "./interactive/InteractiveAudio.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, UploadText } from "@gradio/atoms";
	import type { WaveformOptions } from "./shared/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let interactive: boolean;
	export let value: null | FileData = null;
	export let sources:
		| ["microphone"]
		| ["upload"]
		| ["microphone", "upload"]
		| ["upload", "microphone"];
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let autoplay = false;
	export let show_download_button: boolean;
	export let show_share_button = false;
	export let editable = true;
	export let waveform_options: WaveformOptions = {};
	export let pending: boolean;
	export let streaming: boolean;
	export let gradio: Gradio<{
		change: typeof value;
		stream: typeof value;
		error: string;
		warning: string;
		edit: never;
		play: never;
		pause: never;
		stop: never;
		end: never;
		start_recording: never;
		pause_recording: never;
		stop_recording: never;
		upload: never;
		clear: never;
		share: ShareData;
	}>;

	let old_value: null | FileData = null;

	let active_source: "microphone" | "upload";

	let initial_value: null | FileData = value;

	$: if (value && initial_value === null) {
		initial_value = value;
	}

	const handle_reset_value = (): void => {
		if (initial_value === null || value === initial_value) {
			return;
		}

		value = initial_value;
	};

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	let dragging: boolean;

	$: if (!active_source && sources) {
		active_source = sources[0];
	}

	let waveform_settings: Record<string, any>;

	let color_accent = getComputedStyle(
		document.documentElement
	).getPropertyValue("--color-accent");

	$: waveform_settings = {
		height: 50,
		waveColor: waveform_options.waveform_color || "#9ca3af",
		progressColor: waveform_options.waveform_progress_color || color_accent,
		barWidth: 2,
		barGap: 3,
		cursorWidth: 2,
		cursorColor: "#ddd5e9",
		autoplay: autoplay,
		barRadius: 10,
		dragToSeek: true,
		normalize: true,
		minPxPerSec: 20,
		mediaControls: waveform_options.show_controls,
		sampleRate: waveform_options.sample_rate || 44100
	};

	const trim_region_settings = {
		color: waveform_options.trim_region_color,
		drag: true,
		resize: true
	};

	function set_trim_region_colour(): void {
		document.documentElement.style.setProperty(
			"--trim-region-color",
			trim_region_settings.color || color_accent
		);
	}

	set_trim_region_colour();

	function handle_error({ detail }: CustomEvent<string>): void {
		const [level, status] = detail.includes("Invalid file type")
			? ["warning", "complete"]
			: ["error", "error"];
		loading_status = loading_status || {};
		loading_status.status = status as LoadingStatus["status"];
		loading_status.message = detail;
		gradio.dispatch(level as "error" | "warning", detail);
	}
</script>

{#if !interactive}
	<Block
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		allow_overflow={false}
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
			{show_label}
			{show_download_button}
			{show_share_button}
			{value}
			{label}
			{waveform_settings}
			{waveform_options}
			{editable}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
		/>
	</Block>
{:else}
	<Block
		variant={value === null && active_source === "upload" ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		allow_overflow={false}
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
			{show_download_button}
			{value}
			on:change={({ detail }) => (value = detail)}
			on:stream={({ detail }) => {
				value = detail;
				gradio.dispatch("stream", value);
			}}
			on:drag={({ detail }) => (dragging = detail)}
			{root}
			{sources}
			{active_source}
			{pending}
			{streaming}
			{handle_reset_value}
			{editable}
			bind:dragging
			on:edit={() => gradio.dispatch("edit")}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
			on:start_recording={() => gradio.dispatch("start_recording")}
			on:pause_recording={() => gradio.dispatch("pause_recording")}
			on:stop_recording={(e) => gradio.dispatch("stop_recording")}
			on:upload={() => gradio.dispatch("upload")}
			on:clear={() => gradio.dispatch("clear")}
			on:error={handle_error}
			i18n={gradio.i18n}
			{waveform_settings}
			{waveform_options}
			{trim_region_settings}
		>
			<UploadText i18n={gradio.i18n} type="audio" />
		</InteractiveAudio>
	</Block>
{/if}
