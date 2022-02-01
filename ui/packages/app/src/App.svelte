<script>
	import Interface from "./Interface.svelte";
	// import "./global.css";

	export let title;
	export let description;
	export let theme;
	export let dark;
	export let input_components;
	export let output_components;
	export let examples;
	export let fn;
	export let root;
	export let allow_flagging;
	export let allow_interpretation;
</script>

<div
	class="gradio-bg flex flex-col dark:bg-gray-600 {window.gradio_mode === 'app'
		? 'h-full'
		: 'h-auto'}"
	{theme}
	class:dark
>
	<div
		class="gradio-page container mx-auto flex flex-col box-border flex-grow text-gray-700 dark:text-gray-50"
	>
		<div class="content pt-4 px-4 mb-4">
			{#if title}
				<h1 class="title text-center p-4 text-4xl">{title}</h1>
			{/if}
			{#if description}
				<p class="description pb-4">{description}</p>
			{/if}
			<Interface
				{input_components}
				{output_components}
				{examples}
				{theme}
				{fn}
				{root}
				{allow_flagging}
				{allow_interpretation}
			/>
		</div>
	</div>
</div>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
