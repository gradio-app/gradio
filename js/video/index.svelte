<svelte:options accessors={true} />

<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [FileData, FileData | null] | null = null;
	export let label: string;
	export let source: "upload" | "webcam";
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let height: number | undefined;
	export let width: number | undefined;
	export let mirror_webcam: boolean;
	export let include_audio: boolean;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let autoplay = false;
	export let show_share_button = true;
</script>

{#if mode === "static"}
	<Static
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{label}
		{source}
		{root}
		{root_url}
		{show_label}
		{loading_status}
		{height}
		{width}
		{container}
		{scale}
		{min_width}
		{mode}
		{autoplay}
		{show_share_button}
		on:clear
		on:play
		on:pause
		on:upload
		on:stop
		on:end
		on:start_recording
		on:stop_recording
		on:change
	></Static>
{:else}
	<Interactive
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{label}
		{source}
		{root}
		{root_url}
		{show_label}
		{loading_status}
		{height}
		{width}
		{mirror_webcam}
		{include_audio}
		{container}
		{scale}
		{min_width}
		{mode}
		{autoplay}
		on:clear
		on:play
		on:pause
		on:upload
		on:stop
		on:end
		on:start_recording
		on:stop_recording
		on:change
	></Interactive>
{/if}
