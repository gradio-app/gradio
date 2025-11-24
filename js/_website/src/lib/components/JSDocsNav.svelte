<script lang="ts">
	// @ts-nocheck
	import { clickOutside } from "./clickOutside.js";

	export let js_components: any;

	export let current_nav_link = "";
	export let version_dropdown = false;
	let docs_type = "js";

	let show_nav = false;

	import DropDown from "$lib/components/VersionDropdown.svelte";
</script>

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

	<div class="space-y-8">
		{#if version_dropdown}
			<div class="mb-4">
				<DropDown docs_type="js"></DropDown>
			</div>
		{/if}

		<p
			class="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 px-4 py-1 rounded-full text-orange-800 dark:text-orange-200 mb-4 w-fit text-xs"
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

		<div>
			<h2
				class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
			>
				Components
			</h2>
			<ul class="space-y-2 list-none pl-0">
				{#each js_components as name}
					<li>
						<a
							class:current-nav-link={current_nav_link == name}
							class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
							href="./{name}/">{name}</a
						>
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<h2
				class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
			>
				Client
			</h2>
			<ul class="space-y-2 list-none pl-0">
				<li>
					<a
						class:current-nav-link={current_nav_link == "js-client"}
						class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
						href="./js-client/">JS Client</a
					>
				</li>
			</ul>
		</div>
	</div>
</div>
