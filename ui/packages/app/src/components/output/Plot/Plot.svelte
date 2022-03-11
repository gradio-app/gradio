<script lang="ts">
	export let value: string;
  export let theme: string;
  import { onMount } from 'svelte';
  import Plotly from 'plotly.js-dist-min';

  onMount(() => {
    if (value['type'] == 'plotly') {
      let plotObj = JSON.parse(value['plot'])
      let plotDiv = document.getElementById('plotDiv');			
      let Plot = new Plotly.newPlot(plotDiv, plotObj['data'], plotObj['layout']);
    }
  });
</script>

{#if value['type'] == 'plotly'}
  <div id="plotDiv"></div>
{:else}
  <div
  class="output-image w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
  {theme}
  >
  <!-- svelte-ignore a11y-missing-attribute -->
  <img class="w-full h-full object-contain" src={value['plot']} />
  </div>
{/if}

<style lang="postcss">
</style>