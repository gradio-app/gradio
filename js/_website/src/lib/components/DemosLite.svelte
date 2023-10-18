<script lang="ts">
	import { onMount } from 'svelte';
	import InteractiveCode from "@gradio/code/interactive";
	export let name: string;
	export let code: string;
	export let requirements: string[];

	let mounted = false;
	let controller: any;

	let dummy_elem: any = {classList: {contains: () => false}};
	let dummy_gradio: any = {dispatch: (_) => {}};

	onMount(() => {
		controller = createGradioApp({
			target: document.getElementById(name + "_demo"),
			requirements: requirements,
			code: code,
			info: true,
			container: true,
			isEmbed: true,
			initialHeight: "68vh",
			eager: false,
			themeMode: null,
			autoScroll: false,
			controlPageTitle: false,
			appMode: true
		});
		mounted = true;
	});

	function update(code: string) {
		controller.run_code(code);
	}

$: if (mounted) {
	update(code);
}
</script>

<svelte:head>
	<script type="module" crossorigin=true src="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.css" />
</svelte:head>


<div class="flex w-full" style="height: 70vh;">

<div class="code-editor mx-auto pt-4 pr-4 w-1/2 h-full" id="{name}_code">
	<InteractiveCode bind:value={code} language="python" label="code" target={dummy_elem} gradio={dummy_gradio} lines={10} />

</div>


{#key name}
	<div class="w-1/2 h-full" id="{name}_demo" />
{/key}

</div>

<style>
	:global(div.code-editor div.block) {
		height: 100%;
	}
</style>