<script context="module" lang="ts">
	// @ts-ignore
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Plot from "./shared/Plot.svelte";

	import { Block, BlockLabel } from "@gradio/atoms";
	import { Plot as PlotIcon } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	type ThemeMode = "system" | "light" | "dark";

	export let value: null | string = null;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let target: HTMLElement;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
	export let gradio: Gradio<{
		change: never;
	}>;
	export let show_actions_button = false;
</script>

<Block
	padding={false}
	{elem_id}
	{elem_classes}
	{visible}
	{container}
	{scale}
	{min_width}
	allow_overflow={false}
>
	<BlockLabel
		{show_label}
		label={label || gradio.i18n("plot.plot")}
		Icon={PlotIcon}
	/>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	<Plot
		{value}
		{target}
		{theme_mode}
		{caption}
		{bokeh_version}
		{show_actions_button}
		on:change={() => gradio.dispatch("change")}
	/>
</Block>
