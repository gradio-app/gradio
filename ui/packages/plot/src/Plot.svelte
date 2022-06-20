<svelte:head>
	<!-- Loading Bokeh from CDN -->
	<script src="https://cdn.bokeh.org/bokeh/release/bokeh-2.4.2.min.js" on:load={handleBokehLoaded} ></script>
	{#if bokehLoaded}
		<script src="https://cdn.pydata.org/bokeh/release/bokeh-widgets-2.4.2.min.js" on:load={() => initializeBokeh(1)} ></script>
		<script src="https://cdn.pydata.org/bokeh/release/bokeh-tables-2.4.2.min.js" on:load={() => initializeBokeh(2)}></script>
		<script src="https://cdn.pydata.org/bokeh/release/bokeh-gl-2.4.2.min.js" on:load={() => initializeBokeh(3)}></script>
		<script src="https://cdn.pydata.org/bokeh/release/bokeh-api-2.4.2.min.js" on:load={() => initializeBokeh(4)}></script>
		<script src="https://cdn.pydata.org/bokeh/release/bokeh-api-2.4.2.min.js"  on:load={() => initializeBokeh(5)} ></script>
	{/if}
</svelte:head>

<script lang="ts">
	import Plotly from "plotly.js-dist-min";
	import { Plot as PlotIcon } from "@gradio/icons";
	
	import { afterUpdate } from "svelte";

	export let value: null | string;
	export let theme: string;

	// Plotly
	let plotDiv;

	// Bokeh
	let bokehDiv;
	let bokehLoaded = false
	const resolves = []
	const bokehPromises = Array(6).fill(0).map((_, i) => createPromise(i))

	const initializeBokeh = (index) => {
		if (value && value["type"] == "bokeh") {
			resolves[index]()
    	}
	}

	function createPromise(index) {
		return new Promise((resolve, reject) => {
  		resolves[index] = resolve
		})
	}

	function handleBokehLoaded() {
		initializeBokeh(0)
		bokehLoaded = true
	}

	Promise.all(bokehPromises).then(() => {
		let plotObj = JSON.parse(value["plot"]);
    window.Bokeh.embed.embed_item(plotObj, "bokeh-plot-helper").
		then(() => {
			let plotHelper = document.getElementById("bokeh-plot-helper");
			let plotClone = plotHelper.cloneNode(true);

			bokehDiv.appendChild(plotClone);
		});	
	})

	// Plotly
	afterUpdate(() => {
		if (value && value["type"] == "plotly") {
			let plotObj = JSON.parse(value["plot"]);
			Plotly.newPlot(plotDiv, plotObj["data"], plotObj["layout"]);
		} else if (value && value["type"] == "bokeh") {
			/* Given how bokehJS works, this is a workaround to render
			 the plots. The library uses getElementById to populate
			 the plot inside a div. However the current component
			 lives in the shadowDOM, so that doesn't work. Instead
			 the solution is to render the plot on a helper div and
			 copy it. */

			bokehDiv.innerHTML = "";
			document.getElementById("bokeh-plot-helper").innerHTML = "";
			
			let plotObj = JSON.parse(value["plot"]);

			// Generate the plot on the helper div
			window.Bokeh.embed.embed_item(plotObj, "bokeh-plot-helper").
			then(() => {
				let plotHelper = document.getElementById("bokeh-plot-helper");
				let plotClone = plotHelper.cloneNode(true);

				// Append the plot
				bokehDiv.appendChild(plotClone);
			});
		}
	});
</script>

{#if value && value["type"] == "plotly"}
	<div bind:this={plotDiv}/>
{:else if value && value["type"] == "bokeh"}
	<div bind:this={bokehDiv}/>
{:else if value && value["type"] == "matplotlib"}
	<div
		class="output-image w-full flex justify-center items-center relative"
		{theme}
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img class="w-full max-h-[30rem] object-contain" src={value["plot"]} />
	</div>
{:else}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><PlotIcon/></div>
	</div>
{/if}
