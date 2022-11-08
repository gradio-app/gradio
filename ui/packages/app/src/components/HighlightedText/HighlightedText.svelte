<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { TextHighlight } from "@gradio/icons";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: Array<[string, string | number]>;
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};
	export let label: string;
	export let style: Styles = {};

	$: if (!style.color_map && Object.keys(color_map).length) {
		style.color_map = color_map;
	}

	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<Block
	test_id="highlighted-text"
	{visible}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	{#if label}
		<BlockLabel
			Icon={TextHighlight}
			{label}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}

	{#if value}
		<HighlightedText {value} {show_legend} color_map={style.color_map} />
	{:else}
		<div class="h-full min-h-[6rem] flex justify-center items-center">
			<div class="h-5 dark:text-white opacity-50"><TextHighlight /></div>
		</div>
	{/if}
</Block>
