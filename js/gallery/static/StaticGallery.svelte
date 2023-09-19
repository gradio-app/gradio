<script lang="ts">
	import type { Gradio, ShareData, SelectData } from "@gradio/utils";
	import { Block } from "@gradio/atoms";
	import Gallery from "./Gallery.svelte";
	import type { LoadingStatus } from "@gradio/statustracker";
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
	export let value:
		| { image: FileData; caption: string | null }[]
		| null
		| null = null;
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
	export let gradio: Gradio<{
		select: SelectData;
		share: ShareData;
		error: string;
	}>;
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
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	<Gallery
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:share={(e) => gradio.dispatch("share", e.detail)}
		on:error={(e) => gradio.dispatch("error", e.detail)}
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
		i18n={gradio.i18n}
	/>
</Block>
