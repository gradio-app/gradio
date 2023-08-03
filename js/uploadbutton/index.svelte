<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import type { FileData } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label: string;
	export let value: null | FileData;
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let mode: "static" | "dynamic" = "dynamic";
	export let variant: "primary" | "secondary" | "stop" = "secondary";
</script>

{#if mode === "static"}
	<Static
		bind:value
		{elem_id}
		{elem_classes}
		{visible}
		{file_count}
		{file_types}
		{size}
		{scale}
		{min_width}
		{variant}
		{label}
		{root}
		on:click
		on:upload
		on:change
	/>
{:else}
	<Interactive
		bind:value
		{elem_id}
		{elem_classes}
		{visible}
		{file_count}
		{file_types}
		{size}
		{scale}
		{min_width}
		{variant}
		{label}
		{root}
		on:click
		on:upload
		on:change
	/>
{/if}
