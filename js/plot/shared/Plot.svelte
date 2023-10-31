<script lang="ts">
	//@ts-nocheck
	import Plotly from "plotly.js-dist-min";
	import { Plot as PlotIcon } from "@gradio/icons";
	import { colors as color_palette, ordered_colors } from "@gradio/theme";
	import { get_next_color } from "@gradio/utils";
	import { Vega } from "svelte-vega";
	import { afterUpdate, beforeUpdate, onDestroy } from "svelte";
	import { create_config, bar_plot_header_encoding } from "./utils";
	import { Empty } from "@gradio/atoms";
	import type { ThemeMode } from "js/app/src/components/types";

	export let value;
	export let target;
	let spec = null;
	export let colors: string[] = [];
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
	export let show_actions_button: bool;
	const div_id = `bokehDiv-${Math.random().toString(5).substring(2)}`;

	function get_color(index: number): string {
		let current_color = colors[index % colors.length];

		if (current_color && current_color in color_palette) {
			return color_palette[current_color as keyof typeof color_palette]
				?.primary;
		} else if (!current_color) {
			return color_palette[get_next_color(index) as keyof typeof color_palette]
				.primary;
		}
		return current_color;
	}

	$: darkmode = theme_mode == "dark";

	$: plot = value?.plot;
	$: type = value?.type;

	function embed_bokeh(_plot: Record<string, any>, _type: string): void {
		if (document) {
			if (document.getElementById(div_id)) {
				document.getElementById(div_id).innerHTML = "";
			}
		}
		if (_type == "bokeh" && window.Bokeh) {
			load_bokeh();
			let plotObj = JSON.parse(_plot);
			window.Bokeh.embed.embed_item(plotObj, div_id);
		}
	}

	$: embed_bokeh(plot, type);

	$: if (type == "altair") {
		spec = JSON.parse(plot);
		if (value.chart || "") {
			const config = create_config(darkmode);
			spec.config = config;
		}
		switch (value.chart || "") {
			case "scatter":
				if (spec.encoding.color && spec.encoding.color.type == "nominal") {
					spec.encoding.color.scale.range = spec.encoding.color.scale.range.map(
						(e, i) => get_color(i)
					);
				} else if (
					spec.encoding.color &&
					spec.encoding.color.type == "quantitative"
				) {
					spec.encoding.color.scale.range = ["#eff6ff", "#1e3a8a"];
					spec.encoding.color.scale.range.interpolate = "hsl";
				}
				break;
			case "line":
				spec.layer.forEach((d) => {
					if (d.encoding.color) {
						d.encoding.color.scale.range = d.encoding.color.scale.range.map(
							(e, i) => get_color(i)
						);
					}
				});
				break;
			case "bar":
				if (spec.encoding.color) {
					spec.encoding.color.scale.range = spec.encoding.color.scale.range.map(
						(e, i) => get_color(i)
					);
				}
				spec.config.header = bar_plot_header_encoding(darkmode);
				break;
			default:
				break;
		}
	}

	// Plotly
	let plot_div;
	let plotly_global_style;

	const main_src = `https://cdn.bokeh.org/bokeh/release/bokeh-${bokeh_version}.min.js`;

	const plugins_src = [
		`https://cdn.pydata.org/bokeh/release/bokeh-widgets-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-tables-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-gl-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-api-${bokeh_version}.min.js`
	];

	function load_plugins(): HTMLScriptElement[] {
		return plugins_src.map((src, i) => {
			const script = document.createElement("script");
			script.src = src;
			document.head.appendChild(script);

			return script;
		});
	}

	function load_bokeh(): HTMLScriptElement {
		const script = document.createElement("script");
		script.onload = handle_bokeh_loaded;
		script.src = main_src;
		const is_bokeh_script_present = document.head.querySelector(
			`script[src="${main_src}"]`
		);
		if (!is_bokeh_script_present) {
			document.head.appendChild(script);
		}
		return script;
	}

	function load_plotly_css(): void {
		if (!plotly_global_style) {
			plotly_global_style = document.getElementById("plotly.js-style-global");
			const plotly_style_clone = plotly_global_style.cloneNode();
			target.appendChild(plotly_style_clone);
			for (const rule of plotly_global_style.sheet.cssRules) {
				plotly_style_clone.sheet.insertRule(rule.cssText);
			}
		}
	}

	const main_script = bokeh_version ? load_bokeh() : null;

	let plugin_scripts = [];

	function handle_bokeh_loaded(): void {
		plugin_scripts = load_plugins();
	}

	afterUpdate(() => {
		if (type == "plotly") {
			load_plotly_css();
			let plotObj = JSON.parse(plot);
			plotObj.layout.title
				? (plotObj.layout.margin = { autoexpand: true })
				: (plotObj.layout.margin = { l: 0, r: 0, b: 0, t: 0 });
			Plotly.react(plot_div, plotObj);
		}
	});

	onDestroy(() => {
		if (main_script in document.children) {
			document.removeChild(main_script);
			plugin_scripts.forEach((child) => document.removeChild(child));
		}
	});
</script>

{#if value && type == "plotly"}
	<div data-testid={"plotly"} bind:this={plot_div} />
{:else if type == "bokeh"}
	<div data-testid={"bokeh"} id={div_id} class="gradio-bokeh" />
{:else if type == "altair"}
	<div data-testid={"altair"} class="altair layout">
		<Vega {spec} options={{ actions: show_actions_button }} />
		{#if caption}
			<div class="caption layout">
				{caption}
			</div>
		{/if}
	</div>
{:else if type == "matplotlib"}
	<div data-testid={"matplotlib"} class="matplotlib layout">
		<img src={plot} alt={`${value.chart} plot visualising provided data`} />
	</div>
{:else}
	<Empty unpadded_box={true} size="large"><PlotIcon /></Empty>
{/if}

<style>
	.altair :global(canvas) {
		max-width: 100%;
		padding: 6px;
	}
	.altair :global(.vega-embed) {
		padding: 0px !important;
	}
	.altair :global(.vega-actions) {
		right: 0px !important;
	}
	.gradio-bokeh {
		display: flex;
		justify-content: center;
	}

	.layout {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		color: var(--body-text-color);
	}
	.altair {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
	}

	.caption {
		font-size: var(--text-sm);
		margin-bottom: 6px;
	}

	.matplotlib img {
		object-fit: contain;
	}
</style>
