<script lang="ts">
	import { afterNavigate } from "$app/navigation";
	import InteractiveCode from "@gradio/code/interactive";
	export let demos: {
		name: string;
		dir: string;
		code: string;
		requirements: string[];
	}[];
	export let current_selection: string;

	let mounted = false;
	let controller: any;

	let dummy_elem: any = { classList: { contains: () => false } };
	let dummy_gradio: any = { dispatch: (_) => {} };

	let requirements =
		demos.find((demo) => demo.name === current_selection)?.requirements || [];
	let code = demos.find((demo) => demo.name === current_selection)?.code || "";

	afterNavigate(() => {
		controller = createGradioApp({
			target: document.getElementById("lite-demo"),
			requirements: demos[0].requirements,
			code: demos[0].code,
			info: true,
			container: true,
			isEmbed: true,
			initialHeight: "100%",
			eager: false,
			themeMode: null,
			autoScroll: false,
			controlPageTitle: false,
			appMode: true
		});
		mounted = true;
	});

	function update(code: string, requirements: string[]) {
		try {
			controller.run_code(code);
			controller.install(requirements);
		} catch (error) {
			console.error(error);
		}
		controller.run_code(code);
		controller.install(requirements);
	}

	$: code = demos.find((demo) => demo.name === current_selection)?.code || "";
	$: requirements =
		demos.find((demo) => demo.name === current_selection)?.requirements || [];
	$: if (mounted) {
		update(code, requirements);
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css"
	/>
	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<div class="flex flex-col md:flex-row w-full min-w-0" style="height: 70vh;">
	{#each demos as demo, i}
		<div
			hidden={current_selection !== demo.name}
			class="code-editor mx-auto md:pr-4 w-full md:w-1/2 h-1/2 mb-2 md:mb-0 md:h-full"
		>
			<InteractiveCode
				bind:value={demos[i].code}
				language="python"
				label="code"
				target={dummy_elem}
				gradio={dummy_gradio}
				lines={10}
			/>
		</div>
	{/each}

	<div
		class="lite-demo w-full md:w-1/2 mx-auto h-1/2 md:h-full"
		id="lite-demo"
	/>
</div>

<style>
	:global(div.code-editor div.block) {
		height: 100%;
	}
	:global(div.code-editor div.block div.wrap) {
		height: 90%;
	}
	:global(div.code-editor div.block .cm-gutters) {
		background-color: white;
	}

	:global(div.code-editor div.block .cm-content) {
		width: 0;
	}

	:global(div.lite-demo div.gradio-container) {
		height: 100%;
		overflow-y: scroll;
		margin: 0 !important;
	}
</style>
