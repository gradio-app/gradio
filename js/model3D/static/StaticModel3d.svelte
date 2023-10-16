<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import Model3D from "./Model3D.svelte";
	import { BlockLabel, Block, Empty } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let root: string;
	export let root_url: null | string;
	export let clear_color: [number, number, number, number];
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio;
	export let height: number | undefined = undefined;
	export let zoom_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

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
	{height}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	{#if value}
		<Model3D
			value={_value}
			i18n={gradio.i18n}
			{clear_color}
			{label}
			{show_label}
			{camera_position}
			{zoom_speed}
		/>
	{:else}
		<!-- Not ideal but some bugs to work out before we can 
				 make this consistent with other components -->

		<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

		<Empty unpadded_box={true} size="large"><File /></Empty>
	{/if}
</Block>
