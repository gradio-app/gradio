<script lang="ts">
	//@ts-nocheck
	import Plotly from "plotly.js-dist-min";
	import { untrack } from "svelte";

	let {
		value,
		show_label,
		loaded_plotly_css = $bindable(false)
	}: {
		value: any;
		show_label: boolean;
		loaded_plotly_css?: boolean;
	} = $props();

	let plot = $derived(value?.plot);

	let plot_div: HTMLDivElement;
	let plotly_global_style: HTMLElement;

	function load_plotly_css(): void {
		if (!loaded_plotly_css) {
			plotly_global_style = document.getElementById("plotly.js-style-global");
			const plotly_style_clone = plotly_global_style.cloneNode();
			plot_div.appendChild(plotly_style_clone);
			for (const rule of plotly_global_style.sheet.cssRules) {
				plotly_style_clone.sheet.insertRule(rule.cssText);
			}
			loaded_plotly_css = true;
		}
	}

	$effect(() => {
		if (!plot_div || !plot) return;

		// load_plotly_css writes loaded_plotly_css; untrack it so this effect
		// doesn't re-run and collapse an autosize plot to zero height.
		untrack(() => load_plotly_css());

		let plotObj = JSON.parse(plot);

		plotObj.config = plotObj.config || {};
		plotObj.config.responsive = true;
		plotObj.responsive = true;
		plotObj.layout.autosize = true;

		if (plotObj.layout.margin == undefined) {
			plotObj.layout.margin = {};
		}
		if (plotObj.layout.title && show_label) {
			plotObj.layout.margin.t = Math.max(100, plotObj.layout.margin.t || 0);
		}
		plotObj.layout.margin.autoexpand = true;

		Plotly.react(plot_div, plotObj.data, plotObj.layout, plotObj.config);
		Plotly.Plots.resize(plot_div);
	});
</script>

<div data-testid={"plotly"} bind:this={plot_div}></div>
