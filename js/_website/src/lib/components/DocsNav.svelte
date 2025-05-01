<script lang="ts">
	// @ts-nocheck
	import { clickOutside } from "./clickOutside.js";

	export let library_pages: any;
	export let current_nav_link = "";
	export let show_dropdown = true;
	export let show_nav = false;

	import DropDown from "$lib/components/VersionDropdown.svelte";
</script>

<div
	class:hidden={!show_nav}
	class="fixed inset-0 bg-black/20 backdrop-blur-md lg:hidden z-50"
></div>
<div
	use:clickOutside
	on:click_outside={() => (show_nav = false)}
	class:hidden={!show_nav}
	class="max-w-max min-w-[75%] navigation mobile-nav shadow overflow-y-auto fixed backdrop-blur-lg z-50 bg-white pr-6 pl-4 py-4 -ml-4 h-full inset-0 lg:inset-auto lg:shadow-none lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block lg:rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12 lg:min-w-0"
	id="mobile-nav"
>
	<button
		on:click={() => (show_nav = false)}
		type="button"
		class="absolute z-10 top-4 right-4 w-2/12 h-4 flex items-center justify-center text-grey-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 p-4 lg:hidden"
		tabindex="0"
		data-svelte-h="svelte-1askwj0"
	>
		<svg viewBox="0 0 10 10" class="overflow-visible" style="width: 10px"
			><path
				d="M0 0L10 10M10 0L0 10"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			></path></svg
		>
	</button>

	<p
		class="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit text-xs ml-4"
	>
		Use our <a class="link" href="/main/guides/using-docs-mcp">Docs MCP</a>
	</p>

	{#if show_dropdown}
		<div
			class="w-full sticky top-0 bg-gradient-to-r from-white to-gray-50 z-10 hidden lg:block my-4 ml-4"
		>
			<DropDown></DropDown>
		</div>
	{/if}

	{#each library_pages as category_pages}
		<p class="font-semibold px-4 my-2 block">{category_pages.category}</p>
		{#each category_pages.pages as page}
			<a
				class:current-nav-link={current_nav_link == page.name}
				class="thin-link px-4 block leading-8"
				href={page.name}>{page.pretty_name}</a
			>
		{/each}
	{/each}
</div>
