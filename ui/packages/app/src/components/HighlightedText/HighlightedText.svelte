<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";
	import { Block, BlockTitle } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let value: Array<[string, string | number]>;
	export let default_value: Array<[string, string | number]>;
	export let style: string = "";
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};
	export let label: string;

	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	if (default_value) value = default_value;

	$: value, dispatch("change");
</script>

<Block>
	<StatusTracker {...loading_status} />
	{#if label}
		<BlockTitle>{label}</BlockTitle>
	{/if}
	<HighlightedText {value} {style} {show_legend} {color_map} />
</Block>
