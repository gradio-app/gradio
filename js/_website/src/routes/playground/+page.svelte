<script lang="ts">
	import DemosLite from "../../lib/components/DemosLite.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";

	export let data: {
		demos_by_category: {
			category: string;
			demos: {
				name: string;
				dir: string;
				code: string;
				requirements: string[];
			}[];
		}[];
	};

	let current_selection = "Hello World";
</script>

<MetaTags
	title="Gradio Playground"
	url="https://gradio.app/playground"
	canonical="https://gradio.app/playground"
	description="Play Around with Gradio Demos"
/>

<main class="container mx-auto px-4 gap-4">
	<h2 class="text-4xl font-light mb-2 pt-2 text-orange-500 group">Playground</h2> 
	<p class="mt-4 mb-8 text-lg text-gray-600">
			All the demos on this page are interactive - meaning you can change the code and the embedded demo will update automatically. 
					Use this as a space to explore and play around with Gradio. This is made possible thanks to the 
					<a
					class="link text-black"
					target="_blank"
					href="https://www.npmjs.com/package/@gradio/lite">
					Gradio Lite 
					</a>
					package.
	</p>
		
	<div class="flex w-full border-2 border-orange-200 shadow-sm rounded-xl">
		<div class="lg:my-4 lg:overflow-y-scroll lg:ml-0 lg:p-0 lg:pb-4 lg:text-md lg:block rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12" style="height: 70vh;">
			{#each data.demos_by_category as { category, demos } (category)}
				<p class="px-4 my-2 block">{category}</p>
				{#each demos as demo, i}	
					<button
						on:click={() => (current_selection = demo.name)}
						class:current-playground-demo={current_selection == demo.name}
						class="thin-link font-light px-4 block"
						>{demo.name}</button
					>
				{/each}
			{/each}
		</div>

	<div class="flex flex-col w-full min-w-full lg:w-10/12 lg:min-w-0">
		{#each data.demos_by_category as { category, demos } (category)}
			{#each demos as demo, i}
			<!-- {#if demo.name == "Hello World"} -->
				<div
					class:hidden={current_selection !== demo.name}
					class="demo-content px-4"
				>
					<DemosLite
						name={demo.dir}
						code={demo.code}
						requirements={demo.requirements}

					/>
				</div>
			<!-- {/if} -->
			{/each}
		{/each}
	</div>
</main>

<style>
	.code {
		white-space: pre-wrap;
	}
</style>
