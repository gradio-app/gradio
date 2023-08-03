<svelte:options accessors={true} />

<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import { createEventDispatcher, getContext } from "svelte";

	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	import { upload_files as default_upload_files } from "@gradio/client";

	import type { LoadingStatus } from "@gradio/statustracker/types";

	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData | FileData[];
	export let mode: "static" | "dynamic";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;
	export let file_types: string[] = ["file"];
	export let root_url: null | string;
	export let selectable = false;
	export let loading_status: LoadingStatus;
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
		{mode}
		{root}
		{label}
		{show_label}
		{root_url}
		{selectable}
		{loading_status}
		{container}
		{scale}
		{min_width}
		on:clear
		on:select
		on:change
		on:upload
		on:error
	></Static>
{:else}
	<Interactive
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{mode}
		{root}
		{label}
		{show_label}
		{file_count}
		{file_types}
		{root_url}
		{selectable}
		{loading_status}
		{container}
		{scale}
		{min_width}
		on:clear
		on:select
		on:change
		on:upload
		on:error
	></Interactive>
{/if}
