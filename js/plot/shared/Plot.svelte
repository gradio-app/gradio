<script lang="ts">
	//@ts-nocheck
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { ThemeMode } from "js/app/src/components/types";
	import { beforeUpdate } from "svelte";

	export let value;
	export let target: HTMLElement;
	export let colors: string[] = [];
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
	export let show_actions_button: bool;

	let PlotComponent: any = null;

	const plotTypeMapping = {
		plotly: () => import("./plot_types/PlotlyPlot.svelte"),
		bokeh: () => import("./plot_types/BokehPlot.svelte"),
		altair: () => import("./plot_types/AltairPlot.svelte"),
		matplotlib: () => import("./plot_types/MatplotlibPlot.svelte")
	};

	beforeUpdate(async () => {
		let type = value?.type;
		if (type && type in plotTypeMapping) {
			const module = await plotTypeMapping[type]();
			PlotComponent = module.default;
		}
	});
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
	/>
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
