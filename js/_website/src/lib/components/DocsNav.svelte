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
	class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md lg:hidden z-50"
></div>
<div
	use:clickOutside
	on:click_outside={() => (show_nav = false)}
	class:hidden={!show_nav}
<<<<<<< HEAD
	class="max-w-max min-w-[75%] navigation mobile-nav shadow overflow-y-auto fixed backdrop-blur-lg z-50 bg-white dark:bg-neutral-900 pr-6 pl-4 py-4 -ml-4 h-full inset-0 lg:inset-auto lg:shadow-none lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block lg:rounded-t-xl lg:bg-white lg:dark:bg-neutral-900 lg:overflow-x-clip lg:w-2/12 lg:min-w-0"
=======
	class="w-64 flex-shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto fixed inset-0 z-50 bg-white lg:bg-transparent dark:bg-neutral-900 lg:dark:bg-transparent p-6 lg:sticky lg:top-8 lg:self-start lg:block"
>>>>>>> main
	id="mobile-nav"
>
	<button
		on:click={() => (show_nav = false)}
		type="button"
		class="absolute z-10 top-4 right-4 flex items-center justify-center text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
		tabindex="0"
	>
		<svg viewBox="0 0 10 10" class="w-4 h-4"
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
<<<<<<< HEAD
		class="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 px-4 py-1 mr-2 rounded-full text-orange-800 dark:text-orange-200 mb-1 w-fit text-xs ml-4"
=======
		class="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 px-4 py-1 rounded-full text-orange-800 dark:text-orange-200 mb-4 w-fit text-xs"
>>>>>>> main
	>
		Use our <a class="link" href="/main/guides/using-docs-mcp">Docs MCP</a>
	</p>

	{#if show_dropdown}
<<<<<<< HEAD
		<div
			class="w-full sticky top-0 bg-white dark:bg-neutral-900 z-10 hidden lg:block my-4 ml-4"
		>
=======
		<div class="mb-4">
>>>>>>> main
			<DropDown></DropDown>
		</div>
	{/if}

<<<<<<< HEAD
	{#each library_pages as category_pages}
		<p class="font-semibold px-4 my-2 block text-gray-900 dark:text-gray-100">
			{category_pages.category}
		</p>
		{#each category_pages.pages as page}
			<a
				class:current-nav-link={current_nav_link == page.name}
				class="thin-link px-4 block leading-8"
				href={page.name}>{page.pretty_name}</a
			>
=======
	<div class="space-y-8">
		{#each library_pages as category_pages}
			<div>
				<h2
					class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
				>
					{category_pages.category}
				</h2>
				<ul class="space-y-2 list-none pl-0">
					{#each category_pages.pages as page}
						<li>
							<a
								class:current-nav-link={current_nav_link == page.name}
								class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
								href={page.name}>{page.pretty_name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
>>>>>>> main
		{/each}
	</div>
</div>
