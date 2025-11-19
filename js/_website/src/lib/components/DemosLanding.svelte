<script lang="ts">
	import { hello } from "../assets/demo_code";
	import { theme } from "$lib/stores/theme";
	import { update_gradio_theme } from "$lib/utils";
	import { onMount } from "svelte";

	let tabs = [
		{
			title: "Hello World",
			code: hello,
			demo: "gradio/hello_world"
		},
		{
			title: "Airbnb Map",
			code: false,
			demo: "gradio/map_airbnb"
		},
		{
			title: "Chatbot Streaming",
			code: false,
			demo: "gradio/chatinterface_streaming_echo"
		},
		{
			title: "Diffusion Faces",
			code: false,
			demo: "gradio/fake_gan"
		}
	];

	let current_selection = 0;

	onMount(() => {
		update_gradio_theme($theme);
		setTimeout(() => update_gradio_theme($theme), 500);
	});

	$: if (typeof window !== "undefined" && $theme) {
		update_gradio_theme($theme);
		setTimeout(() => update_gradio_theme($theme), 100);
	}
</script>

<div class="container mx-auto mb-6 px-4 overflow-hidden">
	<nav
		class="flex lg:flex-wrap gap-3 overflow-x-auto py-1 lg:gap-6 whitespace-nowrap text-gray-600 dark:text-gray-400 md:text-lg mb-4 md:mb-0 lg:justify-center"
	>
		{#each tabs as { title }, i}
			<div
				on:click={() => (current_selection = i)}
				class:active-example-tab={current_selection == i}
				class="demo-tab hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer px-3 py-1"
			>
				{title}
			</div>
		{/each}
	</nav>
</div>
<div class="container mx-auto px-4 max-w-7xl">
	{#each tabs as { demo, code }, i (demo)}
		<div
			class:hidden={i !== current_selection}
			class="space-y-6 animate-fadeIn"
		>
			{#if code}
				<div
					class="bg-gray-50 dark:!bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden shadow-sm"
				>
					<div
						class="bg-gray-100 dark:!bg-neutral-900 px-6 py-3 border-b border-gray-200 dark:border-neutral-700 flex items-center gap-2"
					>
						<div class="flex gap-1.5">
							<div class="w-3 h-3 rounded-full bg-red-500/80"></div>
							<div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
							<div class="w-3 h-3 rounded-full bg-green-500/80"></div>
						</div>
						<span
							class="text-sm text-gray-600 dark:text-gray-400 ml-2 font-mono"
							>app.py</span
						>
					</div>
					<div class="codeblock text-sm p-6 overflow-auto max-h-96">
						{@html code}
					</div>
				</div>
			{/if}
			<div
				class="bg-gray-50 dark:!bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden shadow-lg"
			>
				{@html code}
			</div>
			<div class="mx-auto max-w-5xl" class:dark={$theme === "dark"}>
				{#key demo}
					<gradio-app space={demo} theme_mode={$theme} />
				{/key}
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}

	:global(.codeblock pre) {
		background: transparent !important;
		margin: 0 !important;
	}

	:global(.codeblock code) {
		background: transparent !important;
	}
</style>
