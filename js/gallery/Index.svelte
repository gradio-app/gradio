<script context="module" lang="ts">
	export { default as BaseGallery } from "./shared/Gallery.svelte";
</script>

<script lang="ts">
	import type { Gradio, ShareData, SelectData } from "@gradio/utils";
	import { Block, UploadText } from "@gradio/atoms";
	import Gallery from "./shared/Gallery.svelte";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { StatusTracker } from "@gradio/statustracker";
	import type { FileData } from "@gradio/client";
	import { createEventDispatcher } from "svelte";
	import { BaseFileUpload } from "@gradio/file";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let root: string;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { image: FileData; caption: string | null }[] | null = null;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let columns: number | number[] | undefined = [2];
	export let rows: number | number[] | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview = true;
	export let selected_index: number | null = null;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let show_share_button = false;
	export let interactive: boolean;
	export let show_download_button = false;
	export let gradio: Gradio<{
		change: typeof value;
		upload: typeof value;
		select: SelectData;
		share: ShareData;
		error: string;
		prop_change: Record<string, any>;
	}>;

	const dispatch = createEventDispatcher();

	$: no_value = Array.isArray(value) ? value.length === 0 : !value;
	$: selected_index, dispatch("prop_change", { selected_index });
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
	{#if interactive && no_value}
		<BaseFileUpload
			value={null}
			{root}
			{label}
			file_count={"multiple"}
			file_types={["image"]}
			i18n={gradio.i18n}
			on:upload={(e) => {
				const files = Array.isArray(e.detail) ? e.detail : [e.detail];
				value = files.map((x) => ({ image: x, caption: null }));
				gradio.dispatch("upload", value);
			}}
		>
			<UploadText i18n={gradio.i18n} type="gallery" />
		</BaseFileUpload>
	{:else}
		<Gallery
			on:change={() => gradio.dispatch("change", value)}
			on:select={(e) => gradio.dispatch("select", e.detail)}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
			{label}
			{show_label}
			{columns}
			{rows}
			{height}
			{preview}
			{object_fit}
			{interactive}
			{allow_preview}
			bind:selected_index
			bind:value
			{show_share_button}
			{show_download_button}
			i18n={gradio.i18n}
		/>
	{/if}
</Block>
