<svelte:head>
 <script src="https://cdn.bokeh.org/bokeh/release/bokeh-2.0.1.min.js"></script>
 <script src="https://cdn.pydata.org/bokeh/release/bokeh-widgets-1.3.4.min.js"></script>
 <script src="https://cdn.pydata.org/bokeh/release/bokeh-tables-1.3.4.min.js"></script>
 <script src="https://cdn.pydata.org/bokeh/release/bokeh-gl-1.3.4.min.js"></script>
 <script src="https://cdn.pydata.org/bokeh/release/bokeh-api-1.3.4.min.js"></script>
 <script src="https://cdn.pydata.org/bokeh/release/bokeh-api-1.3.4.min.js"></script>
</svelte:head>

<script lang="ts" context="module">
  interface CustomWindow extends Window {
	  Bokeh: any
  }

  declare let window: CustomWindow;
</script>

<script lang="ts">

	export let value: string;
	export let theme: string;
	import { afterUpdate } from "svelte";
	import Plotly from "plotly.js-dist-min";

	afterUpdate(() => {
		if (value["type"] == "plotly") {
			let plotObj = JSON.parse(value["plot"]);
			let plotDiv = document.getElementById("plotDiv");
			Plotly.newPlot(plotDiv, plotObj["data"], plotObj["layout"]);
		} else if (value["type"] == "bokeh") {
      let plotObj = JSON.parse(value["plot"]);
      console.log("Hit!!!")
      console.log(plotObj)
      // let plotDiv = document.getElementById("plotDiv");
      window.Bokeh.embed.embed_item(plotObj, "plotDiv");
    }
	});

</script>

{#if value["type"] == "plotly" || value["type"] == "bokeh" }
	<div id="plotDiv" />
{:else}
	<div
		class="output-image w-full h-60 flex justify-center items-center dark:bg-gray-600 relative"
		{theme}
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img class="w-full h-full object-contain" src={value["plot"]} />
	</div>
{/if}

<style lang="postcss">
</style>
