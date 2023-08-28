<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import Chart from "../shared";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";

	import { Chart as ChartIcon } from "@gradio/icons";

	function format_value(val: StaticData): any {
		return val.data.map((r) =>
			r.reduce((acc, next, i) => ({ ...acc, [val.headers[i]]: next }), {})
		);
	}

	const dispatch = createEventDispatcher<{
		change: undefined;
		clear: undefined;
	}>();

	interface StaticData {
		data: number[][];
		headers: string[];
	}
	interface Data {
		data: number[][] | string;
		headers?: string[];
	}

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | Data;

	export let label: string;
	export let show_label: boolean;
	export let colors: string[];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;

	$: static_data = value && format_value(value as StaticData);

	$: value, dispatch("change");
</script>

<Block
	{visible}
	variant={"solid"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<BlockLabel {show_label} Icon={ChartIcon} label={label || "TimeSeries"} />
	<StatusTracker {...loading_status} />

	{#if static_data}
		<Chart value={static_data} {colors} />
	{:else}
		<Empty unpadded_box={true} size="large">
			<ChartIcon />
		</Empty>
	{/if}
</Block>
