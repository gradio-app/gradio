<svelte:options accessors={true} />

<script lang="ts">
	import { onMount, tick } from "svelte";
	import { Gradio } from "@gradio/utils";
	import { StatusTracker } from "@gradio/statustracker";

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
		(props as any).minimal ?? (gradio.props as any).minimal ?? false
	);

	let active_source = $derived.by(() =>
		gradio.props.sources ? gradio.props.sources[0] : null
	);
	let initial_value = $state(gradio.props.value);

	const handle_reset_value = (): void => {
		if (initial_value === null || gradio.props.value === initial_value) {
			return;
		}
		gradio.props.value = initial_value;
	};

	let dragging = $state(false);
	let recording = $state(gradio.props.recording ?? false);
	$effect(() => {
		gradio.props.recording = recording;
	});

	let color_accent = "darkorange";

	let waveform_settings = $state({
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
		waveColor: gradio.props.waveform_options.waveform_color || "#9ca3af",
		progressColor:
			gradio.props.waveform_options.waveform_progress_color || color_accent,
		mediaControls: gradio.props.waveform_options.show_controls ?? false,
		sampleRate: gradio.props.waveform_options.sample_rate || 44100
	});

	const trim_region_settings = {
		color: gradio.props.waveform_options.trim_region_color,
		drag: true,
		resize: true
	};

	function set_trim_region_colour(): void {
		document.documentElement.style.setProperty(
			"--trim-region-color",
			trim_region_settings.color || color_accent
		);
	}

	function handle_error(detail: string): void {
		const [level, status] = detail.includes("Invalid file type")
			? ["warning", "complete"]
			: ["error", "error"];
		if (gradio.shared.loading_status) {
			(gradio.shared.loading_status as any).status = status;
			(gradio.shared.loading_status as any).message = detail;
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
		set_trim_region_colour();
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
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
			bind:playback_position={gradio.props.playback_position}
			onshare={(detail) => gradio.dispatch("share", detail)}
			onerror={(e) => gradio.dispatch("error", e.detail)}
			onplay={() => gradio.dispatch("play")}
			onpause={() => gradio.dispatch("pause")}
			onstop={() => gradio.dispatch("stop")}
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
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
			value={gradio.props.value}
			subtitles={gradio.props.subtitles}
			onchange={(detail) => (gradio.props.value = detail)}
			onstream={(detail) => {
				gradio.props.value = detail;
				gradio.dispatch("stream", gradio.props.value);
			}}
			ondrag={(detail) => (dragging = detail)}
			root={gradio.shared.root}
			sources={gradio.props.sources}
			active_source={active_source || undefined}
			pending={gradio.shared.loading_status.pending}
			streaming={gradio.props.streaming}
			bind:recording
			loop={gradio.props.loop}
			max_file_size={gradio.shared.max_file_size}
			{handle_reset_value}
			editable={gradio.props.editable}
			bind:dragging
			bind:playback_position={gradio.props.playback_position}
			onedit={() => gradio.dispatch("edit")}
			onplay={() => gradio.dispatch("play")}
			onpause={() => gradio.dispatch("pause")}
			onstop={() => gradio.dispatch("stop")}
			onstart_recording={() => gradio.dispatch("start_recording")}
			onpause_recording={() => gradio.dispatch("pause_recording")}
			onstop_recording={() => {
				gradio.dispatch("stop_recording");
				gradio.dispatch("input");
			}}
			onupload={() => {
				gradio.dispatch("upload");
				gradio.dispatch("input");
			}}
			onclear={() => {
				gradio.dispatch("clear");
				gradio.dispatch("input");
			}}
			onerror={handle_error}
			onclose_stream={() => gradio.dispatch("close_stream", "stream")}
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
