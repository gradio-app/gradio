<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let mode: "static" | "dynamic";
	export let root: string;
	export let root_url: null | string;
	export let clearColor: [number, number, number, number];
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
</script>

{#if mode === "static"}
	<Static
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{root}
		{root_url}
		{clearColor}
		{loading_status}
		{label}
		{show_label}
		{container}
		{scale}
		{min_width}
		on:change
		on:clear
	></Static>
{:else}
	<Interactive
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{root}
		{root_url}
		{clearColor}
		{loading_status}
		{label}
		{show_label}
		{container}
		{scale}
		{min_width}
		on:change
		on:clear
	></Interactive>
{/if}
