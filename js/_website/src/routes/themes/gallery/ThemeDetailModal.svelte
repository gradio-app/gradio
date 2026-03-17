<script lang="ts">
	import type { ThemeData } from "./types";
	import { clickOutside } from "./utils";
	import { page } from "$app/stores";

	export let theme: ThemeData;
	export let on_close: () => void;

	let link_copied = false;
	let code_copied = false;

	$: usage_code = theme.is_official
		? `import gradio as gr

with gr.Blocks(theme=gr.themes.${theme.name}()) as demo:
    ...`
		: `import gradio as gr

with gr.Blocks(theme=gr.Theme.from_hub("${theme.id}")) as demo:
    ...`;

	function copy_link() {
		const url = new URL($page.url.toString());
		url.searchParams.set("id", theme.id);
		navigator.clipboard.writeText(url.toString()).then(() => {
			link_copied = true;
			setTimeout(() => {
				link_copied = false;
			}, 1500);
		});
	}

	function copy_code() {
		navigator.clipboard.writeText(usage_code).then(() => {
			code_copied = true;
			setTimeout(() => {
				code_copied = false;
			}, 1500);
		});
	}

	function is_color_dark(hex: string): boolean {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return false;
		const r = parseInt(result[1], 16);
		const g = parseInt(result[2], 16);
		const b = parseInt(result[3], 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance < 0.5;
	}
</script>

<!-- Backdrop with blur -->
<div
	class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
	on:click={on_close}
	on:keydown={(e) => e.key === "Escape" && on_close()}
	role="button"
	tabindex="0"
	aria-label="Close modal"
></div>

<div
	class="details-panel border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl bg-white dark:bg-neutral-900 p-6 flex flex-col overflow-auto"
	use:clickOutside={on_close}
>
	<!-- Header -->
	<div class="flex justify-between items-start mb-6 shrink-0">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{theme.name}
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				by @{theme.author}
				{#if theme.is_official}
					<span
						class="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-md text-xs font-medium"
					>
						Official
					</span>
				{/if}
			</p>
		</div>
		<div class="flex gap-2">
			{#if !link_copied}
				<button
					on:click={copy_link}
					class="rounded-md px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 bg-orange-400 hover:bg-orange-500 transition-colors"
				>
					Share
				</button>
			{:else}
				<span
					class="rounded-md px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 bg-green-500"
				>
					Link copied!
				</span>
			{/if}
			<button
				on:click={on_close}
				class="rounded-md p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
				aria-label="Close"
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Color Palette -->
	<div class="mb-6">
		<h3
			class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide"
		>
			Colors
		</h3>
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
			{#each [{ label: "Primary", color: theme.colors.primary }, { label: "Accent", color: theme.colors.secondary }, { label: "Neutral", color: theme.colors.neutral }, { label: "Background", color: theme.colors.background }, { label: "Background Dark", color: theme.colors.background_dark }] as { label, color }}
				<div class="flex flex-col">
					<div
						class="h-16 rounded-lg border border-gray-200 dark:border-gray-700 flex items-end justify-start p-2"
						style="background-color: {color};"
					>
						<span
							class="text-xs font-mono px-1.5 py-0.5 rounded"
							style="color: {is_color_dark(color)
								? '#fff'
								: '#000'}; background: {is_color_dark(color)
								? 'rgba(0,0,0,0.2)'
								: 'rgba(255,255,255,0.7)'};"
						>
							{color}
						</span>
					</div>
					<span class="text-xs text-gray-600 dark:text-gray-400 mt-1.5"
						>{label}</span
					>
				</div>
			{/each}
		</div>
	</div>

	<!-- Fonts -->
	<div class="mb-6">
		<h3
			class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide"
		>
			Fonts
		</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div
				class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
			>
				<span
					class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide"
					>Main Font</span
				>
				<p
					class="text-xl mt-1 text-gray-900 dark:text-gray-100"
					style="font-family: '{theme.fonts.main}', sans-serif;"
				>
					{theme.fonts.main}
				</p>
				<p
					class="text-sm text-gray-600 dark:text-gray-400 mt-2"
					style="font-family: '{theme.fonts.main}', sans-serif;"
				>
					The quick brown fox jumps over the lazy dog.
				</p>
			</div>
			<div
				class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
			>
				<span
					class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide"
					>Mono Font</span
				>
				<p
					class="text-xl mt-1 text-gray-900 dark:text-gray-100"
					style="font-family: '{theme.fonts.mono}', monospace;"
				>
					{theme.fonts.mono}
				</p>
				<p
					class="text-sm text-gray-600 dark:text-gray-400 mt-2"
					style="font-family: '{theme.fonts.mono}', monospace;"
				>
					const x = 42;
				</p>
			</div>
		</div>
	</div>

	<!-- Usage Code -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-3">
			<h3
				class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
			>
				Usage
			</h3>
			<button
				on:click={copy_code}
				class="text-xs px-2 py-1 rounded transition-colors {code_copied
					? 'bg-green-500 text-white'
					: 'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-600'}"
			>
				{code_copied ? "Copied!" : "Copy"}
			</button>
		</div>
		<pre
			class="bg-gray-900 dark:bg-neutral-950 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto border border-gray-700"><code
				>{usage_code}</code
			></pre>
	</div>

	<div class="flex justify-center gap-3 shrink-0 pt-2">
		{#if !theme.is_official}
			<a
				href="https://huggingface.co/spaces/{theme.id}"
				target="_blank"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
			>
				<svg
					class="w-4 h-4"
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
				View on Hugging Face
			</a>
		{/if}
	</div>
</div>

<style>
	.details-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-height: 90vh;
		width: 95%;
		max-width: 700px;
		z-index: 1000;
	}
</style>
