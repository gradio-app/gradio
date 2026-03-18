<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { browser } from "$app/environment";
	import type { ThemeData } from "./types";
	import ThemeCard from "./ThemeCard.svelte";
	import ThemeDetailModal from "./ThemeDetailModal.svelte";
	import { theme as siteTheme } from "$lib/stores/theme";

	export let data: { themes: ThemeData[] };

	type FilterType = "all" | "core" | "community";

	$: all_themes = data.themes;
	let themes: ThemeData[] = [];
	let search_query: string = "";
	let selected_theme: ThemeData | null = null;
	let active_filter: FilterType = "all";
	let preview_dark: boolean = $siteTheme === "dark";

	$: core_count = all_themes.filter((t) => t.is_official).length;
	$: community_count = all_themes.filter((t) => !t.is_official).length;

	$: unique_fonts = [
		...new Set(all_themes.flatMap((t) => [t.fonts.main, t.fonts.mono])),
	];
	$: font_url =
		unique_fonts.length > 0
			? `https://fonts.googleapis.com/css2?${unique_fonts.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600`).join("&")}&display=swap`
			: "";
	$: custom_stylesheets = [
		...new Set(all_themes.flatMap((t) => t.stylesheets ?? [])),
	];

	function filter_themes(query: string, filter: FilterType): ThemeData[] {
		let filtered = all_themes;

		if (filter === "core") {
			filtered = filtered.filter((t) => t.is_official);
		} else if (filter === "community") {
			filtered = filtered.filter((t) => !t.is_official);
		}

		if (query.trim()) {
			const lower_query = query.toLowerCase();
			filtered = filtered.filter(
				(theme) =>
					theme.name.toLowerCase().includes(lower_query) ||
					theme.description.toLowerCase().includes(lower_query) ||
					theme.author.toLowerCase().includes(lower_query),
			);
		}

		return filtered;
	}

	function handle_card_click(theme: ThemeData) {
		selected_theme = theme;
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.set("id", theme.id);
			window.history.replaceState({}, "", url.toString());
		}
	}

	function handle_modal_close() {
		selected_theme = null;
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete("id");
			window.history.replaceState({}, "", url.toString());
		}
	}

	function set_filter(filter: FilterType) {
		active_filter = filter;
	}

	if (browser) {
		const params = new URLSearchParams(window.location.search);
		const id = params.get("id");
		if (id) {
			selected_theme = data.themes.find((t) => t.id === id) ?? null;
		}
	}

	$: themes = filter_themes(search_query, active_filter);
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
	{#each custom_stylesheets as sheet}
		<link href={sheet} rel="stylesheet" />
	{/each}
</svelte:head>

<MetaTags
	title="Gradio Theme Gallery"
	url="/themes/gallery"
	canonical="/themes/gallery"
	description="Browse and discover beautiful themes for your Gradio apps."
/>

<div class="container mx-auto px-4 pt-8 mb-16">
	<div class="text-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			Theme Gallery
		</h1>
		<p class="text-gray-600 dark:text-gray-400 text-md max-w-xl mx-auto">
			Customize the look of your Gradio apps. Browse official and community
			themes, preview colors and fonts, then copy the code to use them.
		</p>
	</div>

	<div class="max-w-2xl mx-auto mb-6">
		<input
			type="text"
			class="w-full border border-gray-200 dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-200 p-2.5 rounded-lg outline-none text-center text-md focus:placeholder-transparent focus:border-orange-500 focus:ring-0"
			placeholder="Search themes..."
			autocomplete="off"
			bind:value={search_query}
		/>
	</div>

	<div class="flex items-center justify-center gap-2 mb-6">
		<div class="flex gap-1">
			<button
				on:click={() => set_filter("all")}
				class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors {active_filter ===
				'all'
					? 'bg-orange-500 text-white'
					: 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}"
			>
				All <span class="opacity-70">{all_themes.length}</span>
			</button>
			<button
				on:click={() => set_filter("core")}
				class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors {active_filter ===
				'core'
					? 'bg-orange-500 text-white'
					: 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}"
			>
				Core <span class="opacity-70">{core_count}</span>
			</button>
			{#if community_count > 0}
				<button
					on:click={() => set_filter("community")}
					class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors {active_filter ===
					'community'
						? 'bg-orange-500 text-white'
						: 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}"
				>
					Community <span class="opacity-70">{community_count}</span>
				</button>
			{/if}
		</div>
		<button
			on:click={() => (preview_dark = !preview_dark)}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors {preview_dark
				? 'bg-gray-800 text-white'
				: 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'}"
			title="Toggle all previews between light and dark mode"
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
		class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 !m-0"
	>
		{#each themes as theme (theme.id)}
			<ThemeCard
				{theme}
				dark={preview_dark}
				on_click={() => handle_card_click(theme)}
			/>
		{/each}
	</div>

	{#if themes.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400">
				{#if search_query}
					No themes found matching "{search_query}"
				{:else if active_filter === "community"}
					No community themes yet.
				{:else}
					No themes found
				{/if}
			</p>
		</div>
	{/if}
</div>

{#if selected_theme}
	<ThemeDetailModal theme={selected_theme} on_close={handle_modal_close} />
{/if}
