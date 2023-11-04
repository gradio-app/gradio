<script lang="ts">
	// @ts-nocheck
	import { clickOutside } from "./clickOutside.js";

	export let js_components: any;

	export let current_nav_link = "";
	export let version_dropdown = false;
	let docs_type = "js";

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
	class="top-0 fixed -ml-4 flex items-center p-4 rounded-br-lg backdrop-blur-lg z-50 bg-gray-200/50 lg:hidden"
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
	class="min-w-[200px] navigation mobile-nav overflow-y-auto fixed backdrop-blur-lg z-50 bg-gray-200/50 pr-6 pl-4 py-4 -ml-4 h-full inset-0 w-5/6 lg:inset-auto lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12"
	id="mobile-nav"
>
	<button
		on:click={() => (show_nav = !show_nav)}
		type="button"
		class="absolute z-10 top-4 right-4 w-2/12 h-4 flex items-center justify-center text-grey-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 p-4 lg:hidden"
		tabindex="0"
	>
		<svg viewBox="0 0 10 10" class="overflow-visible" style="width: 10px"
			><path
				d="M0 0L10 10M10 0L0 10"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/></svg
		>
	</button>

	<div
		class="w-full sticky top-0 bg-gradient-to-r from-white to-gray-50 z-10 hidden lg:block my-4 ml-4"
	>
		<input
			bind:value={searchTerm}
			on:input={search}
			bind:this={searchBar}
			id="search"
			type="search"
			class="w-4/5 rounded-md border-gray-200 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0"
			placeholder="Search ⌘-k / ctrl-k"
			autocomplete="off"
		/>
		{#if version_dropdown}
			<DropDown docs_type="js"></DropDown>
		{/if}
		<select
			bind:value={docs_type}
			on:change={() => {
				if (docs_type == "python") {
					window.location.href = "../../docs/";
				}
			}}
			class="rounded-md border-gray-200 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0 text-xs mt-2 py-1 pl-2 pr-7 font-mono"
		>
			<option value="js">js</option>
			<option value="python">python</option>
		</select>
	</div>

	<p
		class="mx-4 block bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-0.5 mr-2 rounded-full text-orange-800 mb-1 w-fit hover:shadow-lg"
	>
		<a class="inline-block" href="./storybook">
			<svg
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="presentation"
				class="w-4 inline-block mb-1"
			>
				<path
					d="M.62 18.43 0 1.92A1.006 1.006 0 0 1 .944.88L14.984.002a1.005 1.005 0 0 1 1.069 1.004v17.989a1.006 1.006 0 0 1-1.051 1.004L1.58 19.396a1.006 1.006 0 0 1-.96-.967Z"
					fill="#FF4785"
				></path>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="m13.88.071-1.932.12-.094 2.267a.15.15 0 0 0 .24.126l.88-.668.744.586a.15.15 0 0 0 .243-.123l-.08-2.308Zm-1.504 7.59c-.353.275-2.989.462-2.989.071.056-1.493-.612-1.558-.984-1.558-.352 0-.946.106-.946.906 0 .815.868 1.275 1.887 1.815 1.447.767 3.2 1.696 3.2 4.032 0 2.24-1.82 3.476-4.14 3.476-2.395 0-4.488-.969-4.252-4.328.093-.394 3.138-.3 3.138 0-.038 1.386.278 1.794 1.076 1.794.613 0 .891-.338.891-.906 0-.861-.904-1.369-1.945-1.953-1.409-.791-3.067-1.722-3.067-3.859 0-2.132 1.466-3.554 4.084-3.554 2.618 0 4.047 1.4 4.047 4.064Z"
					fill="#fff"
				></path>
			</svg>

			Storybook &rarr;</a
		>
	</p>

	<p class="font-semibold px-4 my-2 block">Components</p>

	{#each js_components as name}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{name}</a
		>
	{/each}
	<p class="font-semibold px-4 my-2 block">Client</p>
	<a
		class:current-nav-link={current_nav_link == "js-client"}
		class="px-4 block thin-link"
		href="./js-client/">JS Client</a
	>
</div>
