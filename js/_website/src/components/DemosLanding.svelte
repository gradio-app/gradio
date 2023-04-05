<script lang="ts">
	import { q_a, img, sketch } from "../assets/demo_code";

	let tabs = [
		{ title: "Sketch Recognition", code: sketch, demo: "gradio/pictionary" },
		{
			title: "Question Answering",
			code: q_a,
			demo: "gradio/question-answering"
		},
		{
			title: "Image Segmentation",
			code: img,
			demo: "gradio/Echocardiogram-Segmentation"
		},
		{
			title: "Time Series Forecasting",
			code: false,
			demo: "gradio/timeseries-forecasting-with-prophet"
		},
		{
			title: "XGBoost with Explainability",
			code: false,
			demo: "gradio/xgboost-income-prediction-with-explainability"
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
				class="codeblock rounded-lg bg-gray-50 shadow-inner text-sm md:text-base mx-auto max-w-5xl"
			>
				{@html code}
			</div>
			<div class="mx-auto max-w-5xl">
				<gradio-app space={demo} />
			</div>
		</div>
	{/each}
</div>