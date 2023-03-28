<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { TextHighlight } from "@gradio/icons";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<[string, string | number]>;
	let old_value: Array<[string, string | number]>;
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};
	export let label: string = "Highlighted Text";
	export let style: Styles = {};
	export let selectable: boolean = false;

	$: if (!style.color_map && Object.keys(color_map).length) {
		style.color_map = color_map;
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
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	{#if label}
		<BlockLabel
			Icon={TextHighlight}
			{label}
			float={false}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}

	{#if value}
		<HighlightedText
			on:select
			{selectable}
			{value}
			{show_legend}
			color_map={style.color_map}
		/>
	{:else}
		<Empty>
			<TextHighlight />
		</Empty>
	{/if}
</Block>
