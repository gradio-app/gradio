<script lang="ts">
	import space_logo from "$lib/assets/img/spaces-logo.svg";
	import Demos from "$lib/components/Demos.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";

	export let data: {
		demos_by_category: {
			category: string;
			demos: {
				name: string;
				dir: string;
				code: string;
				highlighted_code: string;
			}[];
		}[];
	};

	let current_selection = 0;
</script>

<MetaTags
	title="Gradio Demos"
	url="https://gradio.app/demos"
	canonical="https://gradio.app/demos"
	description="Play Around with Gradio Demos"
/>

<main class="container mx-auto px-4 gap-4">
	<h2 class="text-4xl font-light mb-2 pt-2 text-orange-500 group">Demos</h2>
	<p class="mt-8 mb-4 text-lg text-gray-600">
		Here are some examples of what you can build with Gradio in just a few lines
		of Python. Once you’re ready to learn, head over to the <a
			class="link text-black"
			target="_blank"
			href="/getting_started">⚡ Quickstart</a
		>.
	</p>
	<p class="mt-4 mb-8 text-lg text-gray-600">
		Check out more demos on <a
			class="link text-black"
			target="_blank"
			href="https://huggingface.co/spaces"
			><img
				class="inline-block my-0 mx-auto w-5 max-w-full pb-1"
				src={space_logo}
			/> Spaces</a
		>.
	</p>
	{#each data.demos_by_category as { category, demos } (category)}
		<div class="category mb-8">
			<h2 class="mb-4 text-2xl font-thin block">{category}</h2>
			<div>
				<div class="demo-window overflow-y-auto h-full w-full my-4">
					<div
						class="relative mx-auto my-auto rounded-md bg-white"
						style="top: 5%; height: 90%"
					>
						<div class="flex overflow-auto pt-4">
							{#each demos as demo, i}
								<button
									on:click={() => (current_selection = i)}
									class:selected-demo-tab={current_selection == i}
									class="demo-btn px-4 py-2 text-lg min-w-max text-gray-600 hover:text-orange-500"
									>{demo.name}</button
								>
							{/each}
						</div>
						{#each demos as demo, i}
							<div
								class:hidden={current_selection !== i}
								class:selected-demo-window={current_selection == i}
								class="demo-content px-4"
							>
								<Demos
									name={demo.dir}
									code={demo.code}
									highlighted_code={demo.highlighted_code}
								/>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/each}
</main>

<style>
	.code {
		white-space: pre-wrap;
	}
</style>
