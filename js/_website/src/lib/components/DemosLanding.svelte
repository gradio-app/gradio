<script lang="ts">
	import { hello } from "../assets/demo_code";

	let tabs = [
		{
			title: "Hello World",
			code: hello,
			demo: "gradio/hello_world"
		},
		{
			title: "Tax Calculator",
			demo: "gradio/tax_calculator"
		},
		{
			title: "Time Series Forecasting",
			code: false,
			demo: "gradio/timeseries-forecasting-with-prophet"
		},
		{
			title: "Image Classification",
			code: false,
			demo: "gradio/image_classification"
		}
	];

	let current_selection = 0;
</script>

<div class="container mx-auto mb-6 px-4 overflow-hidden">
	<nav
		class="flex lg:flex-wrap gap-3 overflow-x-auto py-1 lg:gap-6 whitespace-nowrap text-gray-600 md:text-lg mb-4 md:mb-0 lg:justify-center"
	>
		{#each tabs as { title }, i}
			<div
				on:click={() => (current_selection = i)}
				class:active-example-tab={current_selection == i}
				class="demo-tab hover:text-gray-800 cursor-pointer px-3 py-1"
			>
				{title}
			</div>
		{/each}
	</nav>
</div>
<div class="container mx-auto mb-6 px-4 grid grid-cols-1">
	{#each tabs as { demo, code }, i (demo)}
		<div
			class:hidden={i !== current_selection}
			class="demo space-y-2 md:col-span-3"
		>
			<div
				class:hidden={!code}
				class="codeblock text-sm md:text-base mx-auto max-w-5xl"
			>
				{@html code}
			</div>
			<div class="mx-auto max-w-5xl">
				{#key demo}
					<gradio-app space={demo} />
				{/key}
			</div>
		</div>
	{/each}
</div>
