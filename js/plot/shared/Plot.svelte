<script lang="ts">
	//@ts-nocheck
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { ThemeMode } from "js/core/src/components/types";
	import type { Gradio, SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let value;
	let _value;
	export let colors: string[] = [];
	export let show_label: boolean;
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
	export let show_actions_button: bool;
	export let gradio: Gradio<{
		select: SelectData;
	}>;
	export let x_lim: [number, number] | null = null;
	export let _selectable: boolean;

	let PlotComponent: any = null;
	let _type = value?.type;
	let loaded_plotly_css = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
	}>();

	const plotTypeMapping = {
		plotly: () => import("./plot_types/PlotlyPlot.svelte"),
		bokeh: () => import("./plot_types/BokehPlot.svelte"),
		altair: () => import("./plot_types/AltairPlot.svelte"),
		matplotlib: () => import("./plot_types/MatplotlibPlot.svelte")
	};

	let loadedPlotTypeMapping = {};

	const is_browser = typeof window !== "undefined";
	let key = 0;

	$: if (value !== _value) {
		key += 1;
		let type = value?.type;
		if (type !== _type) {
			PlotComponent = null;
		}
		if (type && type in plotTypeMapping && is_browser) {
			if (loadedPlotTypeMapping[type]) {
				PlotComponent = loadedPlotTypeMapping[type];
			} else {
				plotTypeMapping[type]().then((module) => {
					PlotComponent = module.default;
					loadedPlotTypeMapping[type] = PlotComponent;
				});
			}
		}
		_value = value;
		_type = type;
		dispatch("change");
	}
</script>

{#if value && PlotComponent}
	{#key key}
		<svelte:component
			this={PlotComponent}
			{value}
			{colors}
			{theme_mode}
			{show_label}
			{caption}
			{bokeh_version}
			{show_actions_button}
			{gradio}
			{_selectable}
			{x_lim}
			bind:loaded_plotly_css
			on:load
			on:select
		/>
	{/key}
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
