<script lang="ts">
	//@ts-nocheck
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { ThemeMode } from "js/app/src/components/types";
	import type { Gradio, SelectData } from "@gradio/utils";

	export let value;
	export let target: HTMLElement;
	export let colors: string[] = [];
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

	const plotTypeMapping = {
		plotly: () => import("./plot_types/PlotlyPlot.svelte"),
		bokeh: () => import("./plot_types/BokehPlot.svelte"),
		altair: () => import("./plot_types/AltairPlot.svelte"),
		matplotlib: () => import("./plot_types/MatplotlibPlot.svelte")
	};

	$: {
		let type = value?.type;
		if (type !== _type) {
			PlotComponent = null;
		}
		if (type && type in plotTypeMapping) {
			plotTypeMapping[type]().then((module) => {
				PlotComponent = module.default;
			});
		}
	}
</script>

{#if value && PlotComponent}
	<svelte:component
		this={PlotComponent}
		{value}
		{target}
		{colors}
		{theme_mode}
		{caption}
		{bokeh_version}
		{show_actions_button}
		{gradio}
		{_selectable}
		{x_lim}
		on:load
		on:select
	/>
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
