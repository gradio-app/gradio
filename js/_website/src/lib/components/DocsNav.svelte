<script lang="ts">
	// @ts-nocheck
	import { clickOutside } from "./clickOutside.js";

	export let components: any;
	export let helpers: any;
	export let modals: any;
	export let routes: any;
	export let py_client: any;

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
		<DropDown></DropDown>
		<select
			bind:value={docs_type}
			on:change={() => {
				if (docs_type == "js") {
					window.location.href = "/main/docs/js/";
				}
			}}
			class="rounded-md border-gray-200 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0 text-xs mt-2 py-1 pl-2 pr-7 font-mono"
		>
			<option value="js">js</option>
			<option value="python">python</option>
		</select>
	</div>

	<p class="font-semibold px-4 my-2 block">Building Demos</p>
	<a
		class:current-nav-link={current_nav_link == "interface"}
		class="thin-link px-4 block"
		href="./interface/">Interface</a
	>
	<a
		class:current-nav-link={current_nav_link == "chatinterface"}
		class="thin-link px-4 block"
		href="./chatinterface/"
		>ChatInterface<sup class="text-orange-500">NEW</sup></a
	>
	<a
		class:current-nav-link={current_nav_link == "tabbedinterface"}
		class="thin-link px-4 block"
		href="./tabbedinterface/">TabbedInterface</a
	>

	<a
		class:current-nav-link={current_nav_link == "blocks"}
		class="thin-link px-4 block"
		href="./blocks/">Blocks</a
	>

	<p class="font-semibold px-4 my-2 block">Block Layouts</p>

	<a
		class:current-nav-link={current_nav_link == "row"}
		class="thin-link px-4 block"
		href="./row/">Row</a
	>
	<a
		class:current-nav-link={current_nav_link == "column"}
		class="thin-link px-4 block"
		href="./column/">Column</a
	>
	<a
		class:current-nav-link={current_nav_link == "tab"}
		class="thin-link px-4 block"
		href="./tab/">Tab</a
	>
	<a
		class:current-nav-link={current_nav_link == "group"}
		class="thin-link px-4 block"
		href="./group/">Group</a
	>
	<a
		class:current-nav-link={current_nav_link == "accordion"}
		class="thin-link px-4 block"
		href="./accordion/">Accordion</a
	>

	<a
		class:current-nav-link={current_nav_link == "components"}
		class="link px-4 my-2 block"
		href="./components/">Components</a
	>
	{#each Object.entries(components) as [name, obj] (name)}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{obj.name}</a
		>
	{/each}
	<p class="font-semibold px-4 my-2 block">Helpers</p>
	{#each Object.entries(helpers) as [name, obj] (name)}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{obj.name}</a
		>
	{/each}
	<p class="font-semibold px-4 my-2 block">Modals</p>
	{#each Object.entries(modals) as [name, obj] (name)}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{obj.name}</a
		>
	{/each}

	<p class="font-semibold px-4 my-2 block">Routes</p>
	{#each Object.entries(routes) as [name, obj] (name)}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{obj.name}</a
		>
	{/each}

	<p class="font-semibold px-4 my-2 block">Other</p>

	<a
		class:current-nav-link={current_nav_link == "flagging"}
		class="thin-link px-4 block"
		href="./flagging/">Flagging</a
	>
	<a
		class:current-nav-link={current_nav_link == "themes"}
		class="thin-link px-4 block"
		href="./themes/">Themes</a
	>

	<a
		class:current-nav-link={current_nav_link == "python-client"}
		class="link px-4 my-2 block"
		href="./python-client/">Python Client</a
	>
	{#each Object.entries(py_client) as [name, obj] (name)}
		<a
			class:current-nav-link={current_nav_link == name}
			class="px-4 block thin-link"
			href="./{name}/">{obj.name}</a
		>
	{/each}

	<a
		class:current_nav_link={current_nav_link == "js-client"}
		class="link px-4 my-2 block"
		href="./js-client/">JavaScript Client</a
	>
</div>
