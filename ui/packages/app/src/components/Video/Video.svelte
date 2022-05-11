<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { Video, StaticVideo } from "@gradio/video";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	export let value: FileData | null | string = null;
	export let label: string;
	export let style: Record<string, string> = {};
	export let source: string;
	export let root: string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging = false;
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	style={style["container"]}
>
	<StatusTracker {...loading_status} />

	{#if mode === "static"}
		<StaticVideo value={_value} {label} {show_label} style={style["main"]} />
	{:else}
		<Video
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			{label}
			{show_label}
			{style}
			{source}
			drop_text={$_("interface.drop_video")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
			on:change
			on:clear
			on:play
			on:pause
		/>
	{/if}
</Block>
