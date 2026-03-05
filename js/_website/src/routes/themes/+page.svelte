<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { BUILTIN_THEMES } from "./gallery/utils";
	import ThemeCard from "./gallery/ThemeCard.svelte";

	const themes = [...BUILTIN_THEMES];
	let preview_dark: boolean = false;

	$: unique_fonts = [
		...new Set(themes.flatMap((t) => [t.fonts.main, t.fonts.mono]))
	];
	$: font_url =
		unique_fonts.length > 0
			? `https://fonts.googleapis.com/css2?${unique_fonts.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600`).join("&")}&display=swap`
			: "";

	function handle_theme_click(theme_id: string) {
		goto(`/themes/gallery?id=${theme_id}`);
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	{#if font_url}
		<link href={font_url} rel="stylesheet" />
	{/if}
</svelte:head>

<MetaTags
	title="Gradio Themes"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Customize your Gradio apps with beautiful themes. Browse the gallery or create your own."
/>

<div class="container mx-auto px-4 pt-12 pb-16">
	<div class="text-center mb-16">
		<h1
			class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
		>
			Customize Your Gradio Apps
		</h1>
		<p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
			Give your machine learning demos a unique look with Gradio's theming
			system. Choose from official themes or create your own.
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="/themes/gallery"
				class="inline-flex items-center px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
			>
				Browse Gallery
				<svg
					class="ml-2 w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</a>
			<a
				href="/themes/builder"
				class="inline-flex items-center px-6 py-3 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 font-semibold transition-colors"
			>
				Create a Theme
				<svg
					class="ml-2 w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</a>
		</div>
	</div>

	<div class="mb-16">
		<div class="flex items-center justify-center gap-4 mb-6">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Official Themes
			</h2>
			<button
				on:click={() => (preview_dark = !preview_dark)}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {preview_dark
					? 'bg-gray-800 text-white'
					: 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'}"
			>
				{#if preview_dark}
					<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
						/>
					</svg>
					Dark
				{:else}
					<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
							clip-rule="evenodd"
						/>
					</svg>
					Light
				{/if}
			</button>
		</div>
		<div
			class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
		>
			{#each themes as theme (theme.id)}
				<ThemeCard
					{theme}
					dark={preview_dark}
					on_click={() => handle_theme_click(theme.id)}
				/>
			{/each}
		</div>
	</div>

	<div class="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-8 mb-16">
		<h2
			class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center"
		>
			Quick Start
		</h2>
		<p class="text-gray-600 dark:text-gray-400 text-center mb-6">
			Apply a theme to your Gradio app in just one line of code
		</p>
		<div
			class="bg-gray-900 dark:bg-neutral-900 rounded-lg p-4 max-w-2xl mx-auto"
		>
			<pre class="text-sm text-gray-100 overflow-x-auto"><code
					><span class="text-purple-400">import</span> gradio <span
						class="text-purple-400">as</span
					> gr

<span class="text-purple-400">with</span
					> gr.Blocks(theme=gr.themes.Soft()) <span class="text-purple-400"
						>as</span
					> demo:
    gr.Markdown(<span class="text-green-400">"# Hello World"</span>)
    gr.Textbox(label=<span class="text-green-400">"Input"</span>)
    gr.Button(<span class="text-green-400">"Submit"</span>)</code
				></pre>
		</div>
	</div>

	<div class="text-center">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
			Learn More
		</h2>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="/guides/theming-guide"
				class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-colors"
			>
				<svg
					class="mr-2 w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				Theming Guide
			</a>
			<a
				href="/docs/gradio/themes"
				class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-colors"
			>
				<svg
					class="mr-2 w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
				API Reference
			</a>
			<a
				href="/themes/builder"
				class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-colors"
			>
				<svg
					class="mr-2 w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
					/>
				</svg>
				Theme Builder
			</a>
		</div>
	</div>
</div>
