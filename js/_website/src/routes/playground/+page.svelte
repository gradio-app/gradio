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

	let all_demos = data.demos_by_category.flatMap((category) => category.demos);
	let current_selection = all_demos[0].name;

	let show_nav = true;

	$: show_nav;
</script>

<MetaTags
	title="Gradio Playground"
	url="https://gradio.app/playground"
	canonical="https://gradio.app/playground"
	description="Play Around with Gradio Demos"
/>

<main class="container mx-auto px-4 gap-4">
	<h2 class="text-4xl font-light mb-2 pt-2 text-orange-500 group">
		Playground
	</h2>
	<p class="mt-4 mb-8 text-lg text-gray-600">
		All the demos on this page are interactive - meaning you can change the code
		and the embedded demo will update automatically. Use this as a space to
		explore and play around with Gradio. This is made possible thanks to the
		<a
			class="link text-black"
			target="_blank"
			href="https://gradio.app/guides/gradio-lite"
		>
			Gradio Lite
		</a>
		package.
	</p>

	<p class="mt-4 mb-8 text-lg text-gray-600 md:hidden">
		Playground renders best on desktop.
	</p>

	<div class="flex w-full border border-gray-200 shadow-xl rounded-xl p-4 mb-3">
		<div
			class:w-10={!show_nav}
			class:xl:w-10={!show_nav}
			class:w-[33%]={show_nav}
			class:xl:w-[15%]={show_nav}
			class="mr-4 overflow-y-scroll mb-0 p-0 pb-4 text-md block rounded-t-xl bg-gradient-to-r from-white to-gray-50 overflow-x-clip"
			style="height: 70vh; word-break: normal; overflow-wrap: break-word; white-space:nowrap"
		>
			<button
				on:click={() => (show_nav = !show_nav)}
				class="float-right p-1 px-2 text-gray-600"
				>{#if show_nav}&larr;{:else}&rarr;{/if}</button
			>
			{#if show_nav}
				{#each data.demos_by_category as { category, demos } (category)}
					<p class="px-4 my-2">{category}</p>
					{#each demos as demo, i}
						<button
							on:click={() => (current_selection = demo.name)}
							class:current-playground-demo={current_selection == demo.name}
							class="thin-link font-light px-4 block">{demo.name}</button
						>
					{/each}
				{/each}
			{/if}
		</div>

		<DemosLite demos={all_demos} {current_selection} />
	</div>
</main>

<style>
	.code {
		white-space: pre-wrap;
	}
</style>
