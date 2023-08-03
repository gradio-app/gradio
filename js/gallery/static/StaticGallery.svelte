<script lang="ts">
	import { Block } from "@gradio/atoms";
	import Gallery from "./Gallery.svelte";
	import type { LoadingStatus } from "@gradio/statustracker/types";
	import { StatusTracker } from "@gradio/statustracker";
	import type { FileData } from "@gradio/upload";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let root: string;
	export let root_url: null | string;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: (FileData | string | [FileData | string, string])[] | null =
		null;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let grid_cols: number | number[] | undefined = [2];
	export let grid_rows: number | number[] | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview = true;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let show_share_button = false;
	export let show_download_button = false;
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
	allow_overflow={false}
	height={typeof height === "number" ? height : undefined}
>
	<StatusTracker {...loading_status} />
	<Gallery
		on:select
		on:share
		on:error
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
		{show_share_button}
		{show_download_button}
	/>
</Block>
