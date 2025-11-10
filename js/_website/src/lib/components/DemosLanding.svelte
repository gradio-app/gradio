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

<div class="container mx-auto mb-8 px-4">
	<div class="flex justify-center">
		<div
			class="inline-flex bg-gray-100 dark:!bg-neutral-800 rounded-2xl p-1.5 gap-1"
		>
			{#each tabs as { title }, i}
				<button
					on:click={() => (current_selection = i)}
					class="relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 {current_selection ===
					i
						? 'bg-gray-50 dark:!bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
				>
					{title}
					{#if current_selection === i}
						<div
							class="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 pointer-events-none"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
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
				<div
					class="bg-gray-100 dark:!bg-neutral-900 px-6 py-3 border-b border-gray-200 dark:border-neutral-700"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<svg
								class="w-5 h-5 text-orange-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300"
								>Live Demo</span
							>
						</div>
						<a
							href="https://huggingface.co/spaces/{demo}"
							target="_blank"
							class="text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
						>
							View on HF
							<svg
								class="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</div>
				</div>
				<div class="bg-gray-50 dark:!bg-neutral-900 p-4">
					{#key demo}
						<gradio-app space={demo} theme={$theme} />
					{/key}
				</div>
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
