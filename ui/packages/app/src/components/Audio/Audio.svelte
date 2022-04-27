<script lang="ts">
	import { Audio, StaticAudio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { _ } from "svelte-i18n";

	export let mode: "static" | "dynamic";
	export let value: null | FileData | string = null;
	export let default_value: null | FileData | string = null;
	export let style: string = "";
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let root: string;
	export let show_label: boolean;

	export let loading_status: "complete" | "pending" | "error";

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging: boolean;

	$: console.log($$props);
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<StatusTracker tracked_status={loading_status} />

	{#if mode === "dynamic"}
		<Audio
			{label}
			{show_label}
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			{style}
			{name}
			{source}
			{type}
			on:edit
			on:play
			on:pause
			on:ended
			drop_text={$_("interface.drop_audio")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{:else}
		<StaticAudio
			{show_label}
			value={_value}
			name={_value?.name || "audio_file"}
			{label}
		/>
	{/if}
</Block>
