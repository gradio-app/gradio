<script lang="ts">
	// @ts-nocheck
	import { clickOutside } from "./clickOutside.js";

	export let items: any;
	export let title: string;

	export let current_nav_link = "";
	let docs_type = "python";

	let show_nav = false;
	let searchTerm = "";
	let searchBar: HTMLInputElement;

	const search = () => {
		let links = document.querySelectorAll(
			".navigation a"
		) as NodeListOf<HTMLAnchorElement>;
		links.forEach((link) => {
			let linkText = link.innerText.toLowerCase();
			if (linkText.includes(searchTerm.toLowerCase())) {
				link.style.display = "block";
			} else {
				link.style.display = "none";
			}
		});
	};

	function onKeyDown(e: KeyboardEvent) {
		if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			searchBar.focus();
		}
		if (e.key == "Escape") {
			searchTerm = "";
			searchBar.blur();
			search();
		}
	}

	import DropDown from "$lib/components/VersionDropdown.svelte";
</script>

<svelte:window on:keydown={onKeyDown} />

<section
	class="top-0 fixed -ml-4 flex items-center p-4 rounded-br-lg backdrop-blur-lg z-50 bg-white dark:bg-neutral-900 lg:hidden"
	id="menu-bar"
>
	<button
		on:click={() => (show_nav = !show_nav)}
		type="button"
		class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
	>
		<svg width="24" height="24"
			><path
				d="M5 6h14M5 12h14M5 18h14"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/></svg
		>
	</button>
</section>

<div
	use:clickOutside
	on:click_outside={() => (show_nav = false)}
	class:hidden={!show_nav}
	class="w-64 flex-shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto fixed inset-0 z-50 bg-white lg:bg-transparent dark:bg-neutral-900 lg:dark:bg-transparent p-6 lg:sticky lg:top-8 lg:self-start lg:block"
	id="mobile-nav"
>
	<button
		on:click={() => (show_nav = !show_nav)}
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
			/></svg
		>
	</button>

	<div class="space-y-2">
		<h2
			class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
		>
			{title}
		</h2>
		<ul class="space-y-2 list-none pl-0">
			{#each Object.entries(items) as [name, url] (name)}
				<li>
					<a
						class:current-nav-link={current_nav_link == name}
						class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
						href={url}>{name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
</div>
