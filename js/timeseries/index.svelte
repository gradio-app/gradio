<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	interface StaticData {
		data: number[][];
		headers: string[];
	}
	interface Data {
		data: number[][] | string;
		headers?: string[];
	}

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | Data;
	export let y: string[];
	export let x: string;
	export let mode: "static" | "dynamic";
	export let label: string;
	export let show_label: boolean;
	export let colors: string[];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

{#if mode === "static"}
	<Static
		bind:value
		{elem_id}
		{elem_classes}
		{visible}
		{mode}
		{label}
		{show_label}
		{colors}
		{container}
		{scale}
		{min_width}
		{loading_status}
	></Static>
{:else}
	<Interactive
		bind:value
		{elem_id}
		{elem_classes}
		{visible}
		{y}
		{x}
		{label}
		{show_label}
		{colors}
		{container}
		{scale}
		{min_width}
		{loading_status}
	></Interactive>
{/if}
