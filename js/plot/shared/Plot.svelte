<script lang="ts">
	//@ts-nocheck
	import { Plot as PlotIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { Gradio } from "@gradio/utils";
	import type { PlotEvents, PlotProps } from "../types";
	import { untrack } from "svelte";

	let { gradio }: { gradio: Gradio<PlotEvents, PlotProps> } = $props();

	let PlotComponent: any = $state(null);
	let loaded_plotly_css = $state(false);
	let key = $state(0);

	const plotTypeMapping = {
		plotly: () => import("./plot_types/PlotlyPlot.svelte"),
		bokeh: () => import("./plot_types/BokehPlot.svelte"),
		matplotlib: () => import("./plot_types/MatplotlibPlot.svelte"),
		altair: () => import("./plot_types/AltairPlot.svelte"),
	};

	let loadedPlotTypeMapping = {};

	const is_browser = typeof window !== "undefined";

	let value = $derived(gradio.props.value);
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
		gradio.dispatch("change");
	});
</script>

{#if gradio.props.value && PlotComponent}
	{#key key}
		<PlotComponent
			value={gradio.props.value}
			colors={[]}
			theme_mode={gradio.props.theme_mode}
			show_label={gradio.shared.show_label}
			caption={gradio.props.caption}
			bokeh_version={gradio.props.bokeh_version}
			show_actions_button={gradio.props.show_actions_button}
			{gradio}
			_selectable={gradio.props._selectable}
			x_lim={gradio.props.x_lim}
			bind:loaded_plotly_css
			on:select
		/>
	{/key}
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}
