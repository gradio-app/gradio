<script lang="ts">
	//@ts-nocheck
	import Plotly from "plotly.js-dist-min";
	import type { FileData } from "@gradio/upload";
	import { Plot as PlotIcon } from "@gradio/icons";
	import { colors as color_palette, ordered_colors } from "@gradio/theme";
	import { get_next_color } from "@gradio/utils";
	import { Vega } from "svelte-vega";
	import { afterUpdate, onDestroy } from "svelte";
	import { create_config } from "./utils";
	import { Empty } from "@gradio/atoms";
	import { normalise_file } from "@gradio/upload";

	export let value;
	export let target;
	let spec = null;
	export let colors: Array<string> = [];
	export let theme: string;
	export let caption: string;
	export let root: string;
	export let root_url: string | null;

	function get_color(index: number) {
		let current_color = colors[index % colors.length];

		if (current_color && current_color in color_palette) {
			return color_palette[current_color as keyof typeof color_palette]
				?.primary;
		} else if (!current_color) {
			return color_palette[get_next_color(index) as keyof typeof color_palette]
				.primary;
		} else {
			return current_color;
		}
	}

	$: darkmode = theme == "dark";

	$: if (value && value.type == "altair") {
		spec = JSON.parse(value["plot"]);
		const config = create_config(darkmode);
		spec.config = config;
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
				break;
			default:
				break;
		}
	} else if (value && value.type == "bokeh") {
		let data = <FileData>({is_file: true, name: value.plot});
		console.log(data);
		data = normalise_file(data, root, root_url);
		value.plot = data.data;
		console.log(value.plot);
	}

	// Plotly
	let plotDiv;
	let plotlyGlobalStyle;

	// const main_src = "https://cdn.bokeh.org/bokeh/release/bokeh-2.4.2.min.js";

	// const plugins_src = [
	// 	"https://cdn.pydata.org/bokeh/release/bokeh-widgets-2.4.2.min.js",
	// 	"https://cdn.pydata.org/bokeh/release/bokeh-tables-2.4.2.min.js",
	// 	"https://cdn.pydata.org/bokeh/release/bokeh-gl-2.4.2.min.js",
	// 	"https://cdn.pydata.org/bokeh/release/bokeh-api-2.4.2.min.js"
	// ];

	// function load_plugins() {
	// 	return plugins_src.map((src, i) => {
	// 		const script = document.createElement("script");
	// 		script.onload = () => initializeBokeh(i + 1);
	// 		script.src = src;
	// 		document.head.appendChild(script);

	// 		return script;
	// 	});
	// }

	// function load_bokeh() {
	// 	const script = document.createElement("script");
	// 	script.onload = handleBokehLoaded;
	// 	script.src = main_src;
	// 	document.head.appendChild(script);

	// 	return script;
	// }

	function load_plotly_css() {
		if (!plotlyGlobalStyle) {
			plotlyGlobalStyle = document.getElementById("plotly.js-style-global");
			const plotlyStyleClone = plotlyGlobalStyle.cloneNode();
			target.appendChild(plotlyStyleClone);
			for (const rule of plotlyGlobalStyle.sheet.cssRules) {
				plotlyStyleClone.sheet.insertRule(rule.cssText);
			}
		}
	}

//	const main_script = load_bokeh();

//	let plugin_scripts = [];
	// Bokeh

	// const resolves = [];
	// const bokehPromises = Array(5)
	// 	.fill(0)
	// 	.map((_, i) => createPromise(i));

	// const initializeBokeh = (index) => {
	// 	if (value && value["type"] == "bokeh") {
	// 		resolves[index]();
	// 	}
	// };

	// function createPromise(index) {
	// 	return new Promise((resolve, reject) => {
	// 		resolves[index] = resolve;
	// 	});
	// }

	// function handleBokehLoaded() {
	// 	initializeBokeh(0);
	// 	plugin_scripts = load_plugins();
	// }

	// Promise.all(bokehPromises).then(() => {
	// 	let plotObj = JSON.parse(value["plot"]);
	// 	window.Bokeh.embed.embed_item(plotObj, "bokehDiv");
	// });

	afterUpdate(() => {
		if (value && value["type"] == "plotly") {
			load_plotly_css();
			let plotObj = JSON.parse(value["plot"]);
			plotObj.layout.title
				? (plotObj.layout.margin = { autoexpand: true })
				: (plotObj.layout.margin = { l: 0, r: 0, b: 0, t: 0 });
			Plotly.react(plotDiv, plotObj);
		} //else if (value && value["type"] == "bokeh") {
		// 	document.getElementById("bokehDiv").innerHTML = "";
		// 	let plotObj = JSON.parse(value["plot"]);
		// 	window.Bokeh.embed.embed_item(plotObj, "bokehDiv");
		// }
	});

	// onDestroy(() => {
	// 	if (main_script in document.children) {
	// 		document.removeChild(main_script);
	// 		plugin_scripts.forEach((child) => document.removeChild(child));
	// 	}
	// });
</script>

{#if value && value["type"] == "plotly"}
	<div bind:this={plotDiv} />
{:else if value && value["type"] == "bokeh"}
	<div id="bokehDiv">
		<iframe class='bokeh' src={value['plot']} title='Bokeh Plot'></iframe>
	</div>
{:else if value && value["type"] == "altair"}
	<div class="altair layout">
		<Vega {spec} />
		{#if caption}
			<div class="caption layout">
				{caption}
			</div>
		{/if}
	</div>
{:else if value && value["type"] == "matplotlib"}
	<div class="matplotlib layout">
		<!-- svelte-ignore a11y-missing-attribute -->
		<img src={value["plot"]} />
	</div>
{:else}
	<Empty size="large" unpadded_box={true}><PlotIcon /></Empty>
{/if}

<style>

	.bokeh {
		width: 100%;
		overflow: hidden;
		height: 100vh;

	}

	.layout {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		color: var(--color-text-body);
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
		font-size: var(--scale-000);
	}

	.matplotlib img {
		width: var(--size-full);
		max-height: var(--size-32);
		object-fit: contain;
	}
</style>
