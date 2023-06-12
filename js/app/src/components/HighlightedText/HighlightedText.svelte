<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { TextHighlight } from "@gradio/icons";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<[string, string | number]>;
	let old_value: Array<[string, string | number]>;
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};
	export let label: string = "Highlighted Text";
	export let container: boolean = false;
	export let scale: number = 1;
	export let min_width: number | undefined = undefined;
	export let selectable: boolean = false;

	$: if (!color_map && Object.keys(color_map).length) {
		color_map = color_map;
	}

	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: {
		if (value !== old_value) {
			old_value = value;
			dispatch("change");
		}
	}
</script>

<Block
	test_id="highlighted-text"
	{visible}
	{elem_id}
	{elem_classes}
	padding={false}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />
	{#if label}
		<BlockLabel
			Icon={TextHighlight}
			{label}
			float={false}
			disable={container === false}
		/>
	{/if}

	{#if value}
		<HighlightedText on:select {selectable} {value} {show_legend} {color_map} />
	{:else}
		<Empty>
			<TextHighlight />
		</Empty>
	{/if}
</Block>
