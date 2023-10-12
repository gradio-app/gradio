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
	let update_div: HTMLElement;

	// requirements.push("anyio==3.7.1");

	onMount(() => {
		controller = createGradioApp({
			target: document.getElementById(name + "_demo"),
			requirements: requirements,
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

	function update(code: string) {
		controller.run_code(code);
		update_div.classList.add('bg-orange-500');
		setTimeout(
			function() { update_div.classList.remove('bg-orange-500'); },
			500
		);
	}

$: if (mounted) {
	update(code);
}
</script>

<svelte:head>
	<script type="module" crossorigin src="/lite-dist/lite.js"></script>
	<link rel="stylesheet" href="/lite-dist/lite.css" />
</svelte:head>

<div class="mx-auto p-3 my-3" id="{name}_code">
	<InteractiveCode bind:value={code} language="python" label="code" target={dummy_elem} gradio={dummy_gradio} lines={10} />

</div>


{#key name}
	<div class="h-1 mx-4 rounded-full" bind:this={update_div}></div>
	<div id="{name}_demo" />
{/key}
