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
	export let value: null | string;
	export let theme: string;
	import { afterUpdate, onMount, createEventDispatcher} from "svelte";
	import Plotly from "plotly.js-dist-min";

	// Bokeh
	let bokehLoaded = false
	const resolves = []
	const bokehPromises = Array(6).fill(0).map((_, i) => createPromise(i))

	const initializeBokeh = (index) => {
		if (value["type"] == "bokeh") {
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
    window.Bokeh.embed.embed_item(plotObj, "bokehDiv");	
	})

	// Plotly
	afterUpdate(() => {
		if (value && value["type"] == "plotly") {
			let plotObj = JSON.parse(value["plot"]);
			let plotDiv = document.getElementById("plotlyDiv");
			Plotly.newPlot(plotDiv, plotObj["data"], plotObj["layout"]);
		} else if (value && value["type"] == "bokeh") {
			let plotObj = JSON.parse(value["plot"]);
    	window.Bokeh.embed.embed_item(plotObj, "bokehDiv");
		}
	});
</script>

{#if value && value["type"] == "plotly"}
	<div id="plotlyDiv"/>
{:else if value}
	<div id="bokehDiv"/>
{:else if value && value["type"] == "bokeh"}
	<div
		class="output-image w-full h-80 flex justify-center items-center dark:bg-gray-600 relative"
		{theme}
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img  class="w-full h-full object-contain" src={value["plot"]} />
	</div>
{/if}

<style lang="postcss">
</style>
