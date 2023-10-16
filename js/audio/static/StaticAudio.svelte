<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker";

	import StaticAudio from "./AudioPlayer.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

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
	export let gradio: Gradio<{
		change: typeof value;
		share: ShareData;
		error: string;
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
	variant={mode === "interactive" && value === null && source === "upload"
		? "dashed"
		: "solid"}
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
		on:share={(e) => gradio.dispatch("share", e.detail)}
		on:error={(e) => gradio.dispatch("error", e.detail)}
	/>
</Block>
