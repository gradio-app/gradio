<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { VideoWithCaption } from "@gradio/videowithcaption";
	// import { Video, StaticVideo } from "@gradio/video";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: Array<FileData>;
	export let label: string;
	export let source: string;
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let style: Styles = {};
	// export let mirror_webcam: boolean;

	export let mode: "static" | "dynamic";

	let _src: null | FileData;
	$: _src = normalise_file(value[0], root_url ?? root);

	let _caption: null | FileData;
	$: _caption = normalise_file(value[1], root_url ?? root);

	console.log(_src, _caption);
	let dragging = false;
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
	style={{ height: style.height, width: style.width }}
>
	<StatusTracker {...loading_status} />

	<VideoWithCaption value={_src} caption={_caption} {label} {show_label} />
</Block>

<!-- <div /> -->
