<script lang="ts">
	//@ts-nocheck
	import PlotlyPlot from "./plot_types/PlotlyPlot.svelte";
	import BokehPlot from "./plot_types/BokehPlot.svelte";
	import AltairPlot from "./plot_types/AltairPlot.svelte";
	import MatplotlibPlot from "./plot_types/MatplotlibPlot.svelte";
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { ThemeMode } from "js/app/src/components/types";

	export let value;
	export let target: HTMLElement;
	export let colors: string[] = [];
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
	export let show_actions_button: bool;

	$: type = value?.type;
</script>

{#if value && type == "plotly"}
	<PlotlyPlot {value} {target} />
{:else if type == "bokeh"}
	<BokehPlot {value} {bokeh_version} />
{:else if type == "altair"}
	<AltairPlot
		{value}
		{target}
		{colors}
		{theme_mode}
		{caption}
		{show_actions_button}
	/>
{:else if type == "matplotlib"}
	<MatplotlibPlot {value} />
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
