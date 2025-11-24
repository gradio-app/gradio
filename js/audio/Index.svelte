<svelte:options accessors={true} />

<script lang="ts">
	import { tick } from "svelte";
	import { Gradio } from "@gradio/utils";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { onMount } from "svelte";

	import StaticAudio from "./static/StaticAudio.svelte";
	import InteractiveAudio from "./interactive/InteractiveAudio.svelte";
	import { Block, UploadText } from "@gradio/atoms";
	import type { AudioEvents, AudioProps } from "./shared/types";

	let props = $props();
	let upload_promise = $state<Promise<any>>();

	props.props.stream_every = 0.1; // default to 0.1s stream interval

	class AudioGradio extends Gradio<AudioEvents, AudioProps> {
		async get_data() {
			if (upload_promise) {
				await upload_promise;
				await tick();
			}

			const data = await super.get_data();

			return data;
		}
	}

	const gradio = new AudioGradio(props);
	let label = $derived(gradio.shared.label || gradio.i18n("audio.audio"));
	let minimal = $derived(
		(props as any).minimal ?? (gradio.props as any).minimal ?? false,
	);

	// let uploading = $state(false);
	let active_source = $derived.by(() =>
		gradio.props.sources ? gradio.props.sources[0] : null,
	);
	let initial_value = gradio.props.value;

	const handle_reset_value = (): void => {
		if (initial_value === null || gradio.props.value === initial_value) {
			return;
		}
		gradio.props.value = initial_value;
	};

	let dragging: boolean;

	let color_accent = "darkorange";

	let waveform_settings = $derived({
		height: 50,
		barWidth: 2,
		barGap: 3,
		cursorWidth: 2,
		cursorColor: "#ddd5e9",
		autoplay: gradio.props.autoplay,
		barRadius: 10,
		dragToSeek: true,
		normalize: true,
		minPxPerSec: 20,
	});

	const trim_region_settings = {
		color: gradio.props.waveform_options.trim_region_color,
		drag: true,
		resize: true,
	};

	function set_trim_region_colour(): void {
		document.documentElement.style.setProperty(
			"--trim-region-color",
			trim_region_settings.color || color_accent,
		);
	}

	function handle_error({ detail }: CustomEvent<string>): void {
		const [level, status] = detail.includes("Invalid file type")
			? ["warning", "complete"]
			: ["error", "error"];
		if (gradio.shared.loading_status) {
			gradio.shared.loading_status.status = status as LoadingStatus["status"];
			gradio.shared.loading_status.message = detail;
		}
		gradio.dispatch(level as "error" | "warning", detail);
	}

	let old_value = $state(gradio.props.value);
	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	onMount(() => {
		color_accent = getComputedStyle(document?.documentElement).getPropertyValue(
			"--color-accent",
		);
		set_trim_region_colour();
		waveform_settings.waveColor =
			gradio.props.waveform_options.waveform_color || "#9ca3af";
		waveform_settings.progressColor =
			gradio.props.waveform_options.waveform_progress_color || color_accent;
		waveform_settings.mediaControls =
			gradio.props.waveform_options.show_controls;
		waveform_settings.sampleRate =
			gradio.props.waveform_options.sample_rate || 44100;
	});
</script>

{#if !gradio.shared.interactive}
	<Block
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		allow_overflow={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		visible={gradio.shared.visible}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<StaticAudio
			i18n={gradio.i18n}
			show_label={gradio.shared.show_label}
			buttons={gradio.props.buttons ?? ["download", "share"]}
			value={gradio.props.value}
			subtitles={gradio.props.subtitles}
			{label}
			loop={gradio.props.loop}
			{waveform_settings}
			waveform_options={gradio.props.waveform_options}
			editable={gradio.props.editable}
			{minimal}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
		/>
	</Block>
{:else}
	<Block
		variant={gradio.props.value === null && active_source === "upload"
			? "dashed"
			: "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		allow_overflow={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		visible={gradio.shared.visible}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
		<InteractiveAudio
			bind:upload_promise
			bind:initial_value
			{label}
			show_label={gradio.shared.show_label}
			buttons={gradio.props.buttons ?? []}
			value={gradio.props.value}
			subtitles={gradio.props.subtitles}
			on:change={({ detail }) => (gradio.props.value = detail)}
			on:stream={({ detail }) => {
				gradio.props.value = detail;
				gradio.dispatch("stream", gradio.props.value);
			}}
			on:drag={({ detail }) => (dragging = detail)}
			root={gradio.shared.root}
			sources={gradio.props.sources}
			{active_source}
			pending={gradio.shared.loading_status.pending}
			streaming={gradio.props.streaming}
			bind:recording={gradio.props.recording}
			loop={gradio.props.loop}
			max_file_size={gradio.shared.max_file_size}
			{handle_reset_value}
			editable={gradio.props.editable}
			bind:dragging
			on:edit={() => gradio.dispatch("edit")}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
			on:start_recording={() => gradio.dispatch("start_recording")}
			on:pause_recording={() => gradio.dispatch("pause_recording")}
			on:stop_recording={(e) => {
				gradio.dispatch("stop_recording");
				gradio.dispatch("input");
			}}
			on:upload={() => {
				gradio.dispatch("upload");
				gradio.dispatch("input");
			}}
			on:clear={() => {
				gradio.dispatch("clear");
				gradio.dispatch("input");
			}}
			on:error={handle_error}
			on:close_stream={() => gradio.dispatch("close_stream", "stream")}
			i18n={gradio.i18n}
			{waveform_settings}
			waveform_options={gradio.props.waveform_options}
			{trim_region_settings}
			stream_every={gradio.props.stream_every}
			stream_state={gradio.shared.loading_status.stream_state}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
			time_limit={gradio.shared.loading_status.time_limit}
		>
			<UploadText i18n={gradio.i18n} type="audio" />
		</InteractiveAudio>
	</Block>
{/if}
