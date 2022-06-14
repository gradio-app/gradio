<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { Audio, StaticAudio } from "@gradio/audio";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { Block } from "@gradio/atoms";
	import type { Styles } from "@gradio/utils";
	export let style: Styles = {};

	import { normalise_file } from "@gradio/upload";

	const dispatch = createEventDispatcher<{
		change: typeof value;
		stream: typeof value;
	}>();

	export let elem_id: string = "";
	export let mode: "static" | "dynamic";
	export let value: null | FileData | string = null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let pending: boolean;
	export let streaming: boolean;

	export let loading_status: LoadingStatus;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging: boolean;
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
	style={{ rounded: style.rounded }}
>
	<StatusTracker {...loading_status} />

	{#if mode === "dynamic"}
		<Audio
			{label}
			{show_label}
			value={_value}
			on:change={({ detail }) => {
				value = detail;
				dispatch("change", value);
			}}
			on:stream={({ detail }) => {
				value = detail;
				dispatch("stream", value);
			}}
			on:drag={({ detail }) => (dragging = detail)}
			{name}
			{source}
			{type}
			{pending}
			{streaming}
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
