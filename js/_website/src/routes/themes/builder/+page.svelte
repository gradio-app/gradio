<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { theme } from "$lib/stores/theme";
</script>

<MetaTags
	title="Gradio Theme Builder"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Create and customize your own Gradio theme with an interactive builder."
/>

<div class="container mx-auto px-4 pt-8 pb-4">
	<div class="text-center mb-6">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			Theme Builder
		</h1>
		<p class="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
			Create and customize your own Gradio theme. Adjust colors, fonts, spacing,
			and more, then export the code to use in your app.
		</p>
	</div>

	<div class="flex justify-center gap-4 mb-6">
		<a
			href="/themes/gallery"
			class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 text-sm transition-colors"
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
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Gallery
		</a>
		<a
			href="/guides/theming-guide"
			class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 text-sm transition-colors"
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
	</div>
</div>

<div class="builder-container">
	<gradio-app
		src="https://gradio-theme-builder.hf.space"
		initial_height="800px"
		eager="true"
	></gradio-app>
</div>

<style>
	.builder-container {
		width: 100%;
		min-height: 800px;
	}

	.builder-container :global(gradio-app) {
		min-height: 800px;
	}
</style>
