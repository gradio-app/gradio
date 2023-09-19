<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import StaticVideo from "./VideoPreview.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { video: FileData; subtitles: FileData | null } | null =
		null;
	let old_value: { video: FileData; subtitles: FileData | null } | null = null;

	export let label: string;
	export let source: "upload" | "webcam";
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let height: number | undefined;
	export let width: number | undefined;

	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let autoplay = false;
	export let show_share_button = true;
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
	}>;

	let _video: FileData | null = null;
	let _subtitle: FileData | null = null;

	$: {
		if (value != null) {
			_video = normalise_file(value.video, root, root_url);
			_subtitle = normalise_file(value.subtitles, root, root_url);
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
</script>

<Block
	{visible}
	variant={value === null && source === "upload" ? "dashed" : "solid"}
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
		on:play={() => gradio.dispatch("play")}
		on:pause={() => gradio.dispatch("pause")}
		on:stop={() => gradio.dispatch("stop")}
		on:end={() => gradio.dispatch("end")}
		on:share={({ detail }) => gradio.dispatch("share", detail)}
		on:error={({ detail }) => gradio.dispatch("error", detail)}
		i18n={gradio.i18n}
	/>
</Block>
