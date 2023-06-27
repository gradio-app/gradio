<script lang="ts">
	import { Block } from "@gradio/atoms";
	import { Gallery } from "@gradio/gallery";
	import type { LoadingStatus } from "../StatusTracker/types";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { FileData } from "@gradio/upload";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let root: string;
	export let root_url: null | string;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<string> | Array<FileData> | null = null;
	export let container: boolean = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let grid_cols: number | Array<number> | undefined = [2];
	export let grid_rows: number | Array<number> | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview: boolean = true;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let shareable: boolean | Array<string | number> = false;
</script>

<Block
	{visible}
	variant="solid"
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	height={typeof height === "number" ? height : undefined}
>
	<StatusTracker {...loading_status} />
	<Gallery
		on:select
		on:share
		{label}
		{value}
		{show_label}
		{root}
		{root_url}
		{grid_cols}
		{grid_rows}
		{height}
		{preview}
		{object_fit}
		{allow_preview}
		{shareable}
	/>
</Block>
