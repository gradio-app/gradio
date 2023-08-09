<svelte:options accessors={true} />

<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	import Audio from "./interactive";
	import StaticAudio from "./static";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let mode: "static" | "dynamic";
	export let value: null | FileData | string = null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let pending: boolean;
	export let streaming: boolean;
	export let root_url: null | string;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let autoplay = false;
	export let show_download_button = true;
	export let show_share_button = false;
	export let show_edit_button = true;
</script>

{#if mode === "dynamic"}
	<Audio
		{elem_id}
		{elem_classes}
		{visible}
		{mode}
		bind:value
		{name}
		{source}
		{label}
		{root}
		{show_label}
		{pending}
		{streaming}
		{root_url}
		{container}
		{scale}
		{min_width}
		{loading_status}
		{autoplay}
		{show_edit_button}
		on:change
		on:stream
		on:drag
		on:edit
		on:play
		on:pause
		on:stop
		on:end
		on:start_recording
		on:stop_recording
		on:upload
		on:error
	/>
{:else}
	<StaticAudio
		{elem_id}
		{elem_classes}
		{visible}
		{mode}
		bind:value
		{source}
		{label}
		{root}
		{show_label}
		{root_url}
		{container}
		{scale}
		{min_width}
		{loading_status}
		{autoplay}
		{show_download_button}
		{show_share_button}
		on:change
		on:stream
		on:drag
		on:edit
		on:play
		on:pause
		on:stop
		on:end
		on:start_recording
		on:stop_recording
		on:upload
		on:error
	/>
{/if}
