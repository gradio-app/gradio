<script lang="ts">
	import { onMount } from 'svelte';
	import InteractiveCode from "@gradio/code/interactive";
	export let name: string;
	export let code: string;
	export let highlighted_code: string;

	let mounted = false;
	let controller: any;

	let dummy_elem: any = {classList: {contains: () => false}};
	let dummy_gradio: any = {dispatch: (_) => {}};

	onMount(() => {
		controller = createGradioApp({
			target: document.getElementById(name + "_demo"),
			requirements: [],
			code: code,
			info: true,
			container: true,
			isEmbed: true,
			initialHeight: "300px",
			eager: false,
			themeMode: null,
			autoScroll: false,
			controlPageTitle: false,
			appMode: true
		});
		mounted = true;
	});

$: if (mounted) {
	controller.run_code(code);
}
</script>

<svelte:head>
	<script type="module" crossorigin src="/lite-dist/lite.js"></script>
	<link rel="stylesheet" href="/lite-dist/lite.css" />
</svelte:head>

<div class="mx-auto p-3 my-3" id="{name}_code">
	<InteractiveCode bind:value={code} language="python" label="code" target={dummy_elem} gradio={dummy_gradio} />

</div>


{#key name}
	<div id="{name}_demo" />
{/key}
