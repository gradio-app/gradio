<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import Model3D from "./Model3d.svelte";
	import { BlockLabel, Block, Empty } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";
	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let root: string;
	export let root_url: null | string;
	export let clearColor: [number, number, number, number];
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;

	let _value: null | FileData;
	$: _value = normalise_file(value, root, root_url);

	let dragging = false;
</script>

<Block
	{visible}
	variant={value === null ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />

	{#if value}
		<Model3D value={_value} {clearColor} {label} {show_label} />
	{:else}
		<!-- Not ideal but some bugs to work out before we can 
				 make this consistent with other components -->

		<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

		<Empty unpadded_box={true} size="large"><File /></Empty>
	{/if}
</Block>
