<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseMultimodalTextbox } from "./shared/MultimodalTextbox.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio, type SelectData } from "@gradio/utils";
	import MultimodalTextbox from "./shared/MultimodalTextbox.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { FileData } from "@gradio/client";
	import { onMount } from "svelte";
	import type { WaveformOptions } from "../audio/shared/types";
	import type { InputHTMLAttributes } from "./shared/types";
	import type {
		MultimodalTextboxProps,
		MultimodalTextboxEvents,
	} from "./types";
	let props = $props();
	const gradio = new Gradio<MultimodalTextboxEvents, MultimodalTextboxProps>(
		props,
	);

	let dragging: boolean;
	let active_source: "microphone" | null = null;

	let color_accent = "darkorange";

	const waveform_settings = {
		height: 50,
		barWidth: 2,
		barGap: 3,
		cursorWidth: 2,
		cursorColor: "#ddd5e9",
		autoplay: false,
		barRadius: 10,
		dragToSeek: true,
		normalize: true,
		minPxPerSec: 20,
		waveColor: "",
		progressColor: "",
		mediaControls: false as boolean | undefined,
		sampleRate: 44100,
	};

	onMount(() => {
		color_accent = getComputedStyle(document?.documentElement).getPropertyValue(
			"--color-accent",
		);
		set_trim_region_colour();
		waveform_settings.waveColor =
			gradio.props?.waveform_options?.waveform_color || "#9ca3af";
		waveform_settings.progressColor =
			gradio.props?.waveform_options?.waveform_progress_color || color_accent;
		waveform_settings.mediaControls =
			gradio.props?.waveform_options?.show_controls;
		waveform_settings.sampleRate =
			gradio.props?.waveform_options?.sample_rate || 44100;
	});

	const trim_region_settings = {
		color: gradio.props?.waveform_options?.trim_region_color,
		drag: true,
		resize: true,
	};

	function set_trim_region_colour(): void {
		document.documentElement.style.setProperty(
			"--trim-region-color",
			trim_region_settings.color || color_accent,
		);
	}

	// Create const references to the callbacks so that afterUpdate in child is not called on every prop change
	// in the DOM. See https://github.com/gradio-app/gradio/issues/11933
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const upload_fn = (...args: Parameters<typeof gradio.shared.client.upload>) =>
		gradio.shared.client.upload(...args);
	const i18n = (s: string | null | undefined): string => gradio.i18n(s);
	const stream_handler_fn = (
		...args: Parameters<typeof gradio.shared.client.stream>
	): EventSource => gradio.shared.client.stream(...args);

	let sources_string = $derived(
		gradio.props.sources.join(",") as
			| "upload"
			| "upload,microphone"
			| "microphone"
			| "microphone,upload",
	);

	$inspect("multimodaltextbox", gradio);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={[...(gradio.shared.elem_classes || []), "multimodal-textbox"]}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	padding={false}
	border_mode={dragging ? "focus" : "base"}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}

	<MultimodalTextbox
		value={gradio.props.value}
		value_is_output
		bind:dragging
		bind:active_source
		file_types={gradio.props.file_types}
		root={gradio.shared.root}
		label={gradio.shared.label}
		info={gradio.props.info}
		show_label={gradio.shared.show_label}
		lines={gradio.props.lines}
		rtl={gradio.props.rtl}
		text_align={gradio.props.text_align}
		waveform_settings={waveform_settings as WaveformOptions}
		{i18n}
		max_lines={!gradio.props.max_lines
			? gradio.props.lines + 1
			: gradio.props.max_lines}
		placeholder={gradio.props.placeholder}
		submit_btn={gradio.props.submit_btn}
		stop_btn={gradio.props.stop_btn}
		autofocus={gradio.props.autofocus}
		autoscroll={gradio.shared.autoscroll}
		file_count={gradio.props.file_count}
		{sources_string}
		max_file_size={gradio.shared.max_file_size}
		on:change={(e) => (
			(gradio.props.value = e.detail),
			gradio.dispatch("change", gradio.props.value)
		)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:stop={() => gradio.dispatch("stop")}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:error={({ detail }) => {
			gradio.dispatch("error", detail);
		}}
		on:start_recording={() => gradio.dispatch("start_recording")}
		on:pause_recording={() => gradio.dispatch("pause_recording")}
		on:stop_recording={() => gradio.dispatch("stop_recording")}
		on:upload={(e) => gradio.dispatch("upload", e.detail)}
		on:clear={() => gradio.dispatch("clear")}
		disabled={!gradio.shared.interactive}
		upload={upload_fn}
		stream_handler={stream_handler_fn}
		max_plain_text_length={gradio.props.max_plain_text_length}
		html_attributes={gradio.props.html_attributes}
	/>
</Block>
