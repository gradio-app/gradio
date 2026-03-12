<script lang="ts">
	//@ts-nocheck
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { Gradio } from "@gradio/utils";
	import type { PlotEvents, PlotProps } from "../types";
	import { untrack } from "svelte";

	let {
		value,
		theme_mode,
		caption,
		bokeh_version,
		show_actions_button,
		_selectable,
		x_lim,
		show_fullscreen_button,
		show_label,
		on_change
	}: {
		value: null | string;
		theme_mode: ThemeMode;
		caption: string;
		bokeh_version: string | null;
		show_actions_button: boolean;
		_selectable: boolean;
		x_lim: [number, number] | null;
		show_fullscreen_button: boolean;
		show_label: boolean;
		on_change: () => void;
	} = $props();

	let PlotComponent: any = $state(null);
	let loaded_plotly_css = $state(false);
	let key = $state(0);

	const plotTypeMapping = {
		plotly: () => import("./plot_types/PlotlyPlot.svelte"),
		bokeh: () => import("./plot_types/BokehPlot.svelte"),
		matplotlib: () => import("./plot_types/MatplotlibPlot.svelte"),
		altair: () => import("./plot_types/AltairPlot.svelte")
	};

	let loadedPlotTypeMapping = {};

	const is_browser = typeof window !== "undefined";
	let _type = $state(null);

	$effect(() => {
		let type = value?.type;
		untrack(() => {
			key = key + 1;
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
			_type = type;
		});
		on_change();
	});
</script>

{#if value && PlotComponent}
	{#key key}
		<PlotComponent
			{value}
			colors={[]}
			{theme_mode}
			{show_label}
			{caption}
			{bokeh_version}
			{show_actions_button}
			{_selectable}
			{x_lim}
			bind:loaded_plotly_css
			on:select
		/>
	{/key}
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
