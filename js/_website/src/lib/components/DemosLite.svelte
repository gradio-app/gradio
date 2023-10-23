<script lang="ts">
	import { afterNavigate } from "$app/navigation";
	import InteractiveCode from "@gradio/code/interactive";
	import Slider from "./Slider.svelte";
	import Fullscreen from "./icons/Fullscreen.svelte";
	import Close from "./icons/Close.svelte";

	export let demos: {
		name: string;
		dir: string;
		code: string;
		requirements: string[];
	}[];
	export let current_selection: string;
	export let show_nav = true;
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

	let position = 0.5;

	let fullscreen = false;
	function make_full_screen() {
		fullscreen = true;
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css"
	/>
	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<div
	class=" absolute top-0 bottom-0 right-0"
	style="left:{show_nav ? 200 : 37}px"
>
	<Slider bind:position>
		<div class=" flex-col md:flex-row min-w-0 h-full" class:flex={!fullscreen}>
			{#each demos as demo, i}
				<div
					hidden={current_selection !== demo.name}
					class="code-editor w-full border-r"
					style="width: {position * 100}%"
				>
					<div class="flex justify-between align-middle h-8 border-b pl-4 pr-2">
						<h3 class="pt-1">Code</h3>
					</div>

					<InteractiveCode
						bind:value={demos[i].code}
						label=""
						language="python"
						target={dummy_elem}
						gradio={dummy_gradio}
						lines={10}
					/>
				</div>
			{/each}

			<div
				class=" w-full mx-auto"
				style="width: {fullscreen ? 100 : (1 - position) * 100}%"
				class:fullscreen
			>
				<div class="flex justify-between align-middle h-8 border-b pl-4 pr-2">
					<h3 class="pt-1">Preview</h3>
					<div class="flex">
						{#if !fullscreen}<button
								class="ml-1 w-[20px] float-right text-gray-600"
								on:click={() => (fullscreen = true)}><Fullscreen /></button
							>{:else}
							<button
								class="ml-1 w-[15px] float-right text-gray-600"
								on:click={() => (fullscreen = false)}><Close /></button
							>
						{/if}
					</div>
				</div>

				<div class="lite-demo h-[93%]" id="lite-demo" />
			</div>
		</div>
	</Slider>
</div>

<style>
	:global(div.code-editor div.block) {
		height: calc(100% - 2rem);
		border-radius: 0;
		border: none;
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

	.code-editor :global(label) {
		display: none;
	}

	.code-editor :global(.codemirror-wrappper) {
		border-radius: var(--block-radius);
	}

	.code-editor :global(> .block) {
		border: none !important;
	}

	.code-editor :global(.cm-scroller) {
		height: 100% !important;
	}

	.lite-demo :global(.embed-container) {
		border: none !important;
	}

	.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
		background-color: white;
	}
</style>
