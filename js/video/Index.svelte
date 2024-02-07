<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import type { FileData } from "@gradio/client";
	import { Block, UploadText } from "@gradio/atoms";
	import StaticVideo from "./shared/VideoPreview.svelte";
	import Video from "./shared/InteractiveVideo.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { video: FileData; subtitles: FileData | null } | null =
		null;
	let old_value: { video: FileData; subtitles: FileData | null } | null = null;

	export let label: string;
	export let sources:
		| ["webcam"]
		| ["upload"]
		| ["webcam", "upload"]
		| ["upload", "webcam"];
	export let root: string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let height: number | undefined;
	export let width: number | undefined;

	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let autoplay = false;
	export let show_share_button = true;
	export let show_download_button: boolean;
	export let gradio: Gradio<{
		change: never;
		clear: never;
		play: never;
		pause: never;
		upload: never;
		stop: never;
		end: never;
		start_recording: never;
		stop_recording: never;
		share: ShareData;
		error: string;
		warning: string;
	}>;
	export let interactive: boolean;
	export let mirror_webcam: boolean;
	export let include_audio: boolean;

	let _video: FileData | null = null;
	let _subtitle: FileData | null = null;

	let active_source: "webcam" | "upload";

	let initial_value: { video: FileData; subtitles: FileData | null } | null =
		value;

	$: if (value && initial_value === null) {
		initial_value = value;
	}

	const handle_reset_value = (): void => {
		if (initial_value === null || value === initial_value) {
			return;
		}

		value = initial_value;
	};

	$: if (sources && !active_source) {
		active_source = sources[0];
	}

	$: {
		if (value != null) {
			_video = value.video;
			_subtitle = value.subtitles;
		} else {
			_video = null;
			_subtitle = null;
		}
	}

	let dragging = false;

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	function handle_change({ detail }: CustomEvent<FileData | null>): void {
		if (detail != null) {
			value = { video: detail, subtitles: null } as {
				video: FileData;
				subtitles: FileData | null;
			} | null;
		} else {
			value = null;
		}
	}

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
		{visible}
		variant={value === null && active_source === "upload" ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		{height}
		{width}
		{container}
		{scale}
		{min_width}
		allow_overflow={false}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>

		<StaticVideo
			value={_video}
			subtitle={_subtitle}
			{label}
			{show_label}
			{autoplay}
			{show_share_button}
			{show_download_button}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
			on:end={() => gradio.dispatch("end")}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			i18n={gradio.i18n}
		/>
	</Block>
{:else}
	<Block
		{visible}
		variant={value === null && active_source === "upload" ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		{height}
		{width}
		{container}
		{scale}
		{min_width}
		allow_overflow={false}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>

		<Video
			value={_video}
			subtitle={_subtitle}
			on:change={handle_change}
			on:drag={({ detail }) => (dragging = detail)}
			on:error={handle_error}
			{label}
			{show_label}
			{show_download_button}
			{sources}
			{active_source}
			{mirror_webcam}
			{include_audio}
			{autoplay}
			{root}
			{handle_reset_value}
			on:clear={() => gradio.dispatch("clear")}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:upload={() => gradio.dispatch("upload")}
			on:stop={() => gradio.dispatch("stop")}
			on:end={() => gradio.dispatch("end")}
			on:start_recording={() => gradio.dispatch("start_recording")}
			on:stop_recording={() => gradio.dispatch("stop_recording")}
			i18n={gradio.i18n}
		>
			<UploadText i18n={gradio.i18n} type="video" />
		</Video>
	</Block>
{/if}
