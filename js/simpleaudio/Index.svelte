<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker";

	import { BaseStaticAudio } from "@gradio/audio";
    import type { WaveformOptions } from "@gradio/audio";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, UploadText, BlockLabel } from "@gradio/atoms";
    import { Upload, ModifyUpload, normalise_file } from "@gradio/upload";
    import { Music } from "@gradio/icons";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let mode: "static" | "interactive";
	export let value: null | FileData = null;
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
	export let waveform_options: WaveformOptions = {};
	export let pending: boolean;
	export let streaming: boolean;
	export let gradio: Gradio<{
		change: never;
		error: string;
		play: never;
		pause: never;
		stop: never;
		end: never;
		upload: never;
		clear: never;
		share: ShareData;
	}>;

	let old_value: null | FileData | string = null;

	let initial_value: null | FileData | string = value;

	$: if (value && initial_value === null) {
		initial_value = value;
	}

	const handle_clear = (): void => {
		if (initial_value === null || value === initial_value) {
			return;
		}

		value = initial_value;
	};

    function handle_load({ detail }: CustomEvent<FileData | null>): void {
		if (detail != null) {
			value = detail;
			gradio.dispatch("upload");
		}
	}

    $: {
		if (value != null) {
            value = normalise_file(value, root, root_url);
	    }
    }

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

    $: interactive = mode === "interactive";

    $: console.log("interactive", interactive)

	let dragging: boolean;

	const waveform_settings = {
		height: 50,
		waveColor: waveform_options.waveform_color || "#9ca3af",
		progressColor: waveform_options.waveform_progress_color || "#f97316",
		barWidth: 2,
		barGap: 3,
		barHeight: 4,
		cursorWidth: 2,
		cursorColor: "#ddd5e9",
		barRadius: 10,
		dragToSeek: true,
		mediaControls: waveform_options.show_controls,
	};
</script>

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

    <BlockLabel {show_label} Icon={Music} float={value === null} label={label || gradio.i18n("audio.audio")} />
	{#if value === null && interactive}
        <Upload
            bind:dragging
            filetype="audio/aac,audio/midi,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/opus,audio/webm,audio/flac,audio/vnd.rn-realaudio,audio/x-ms-wma,audio/x-aiff,audio/amr,audio/*"
            on:load={handle_load}
            {root}
        >
            <UploadText i18n={gradio.i18n} type="video" />
        </Upload>
	{:else}
		{#if interactive}
			<ModifyUpload i18n={gradio.i18n} on:clear={handle_clear} />
		{/if}
            <BaseStaticAudio
                i18n={gradio.i18n}
                {autoplay}
                {show_label}
                {show_download_button}
                {show_share_button}
                value={value}
                name={value?.name || "audio_file"}
                {label}
                {waveform_settings}
                on:play={() => gradio.dispatch("play")}
                on:pause={() => gradio.dispatch("pause")}
                on:stop={() => gradio.dispatch("stop")}
                on:end={() => gradio.dispatch("end")}
                on:share={(e) => gradio.dispatch("share", e.detail)}
                on:error={(e) => gradio.dispatch("error", e.detail)}
            />
	{/if}
</Block>
