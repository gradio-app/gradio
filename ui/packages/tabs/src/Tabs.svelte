<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext, createEventDispatcher, onMount, tick } from "svelte";
	import { writable } from "svelte/store";

	interface Tab {
		name: string;
		id: object;
	}

	export let elem_id: string;
	export let selected: number | string | object;

	let tabs: Array<Tab> = [];

	const selected_tab = writable<false | object | number | string>(false);
	const dispatch = createEventDispatcher<{ change: undefined }>();

	setContext(TABS, {
		register_tab: (tab: Tab) => {
			tabs.push({ name: tab.name, id: tab.id });
			selected_tab.update((current) => current ?? tab.id);
			tabs = tabs;
		},
		unregister_tab: (tab: Tab) => {
			const i = tabs.findIndex((t) => t.id === tab.id);
			tabs.splice(i, 1);
			selected_tab.update((current) =>
				current === tab.id ? tabs[i]?.id || tabs[tabs.length - 1]?.id : current
			);
		},

		selected_tab
	});

	function change_tab(id: object | string | number) {
		$selected_tab = id;
		dispatch("change");
	}

	$: selected !== null && change_tab(selected);
</script>

<div class="tabs flex flex-col my-4" id={elem_id}>
	<div class="flex border-b-2 dark:border-gray-700">
		{#each tabs as t (t.id)}
			{#if t.id === $selected_tab}
				<button
					class="bg-white px-4 pb-2 pt-1.5 rounded-t-lg border-gray-200 -mb-[2px] border-2 border-b-0"
				>
					{t.name}
				</button>
			{:else}
				<button
					class="px-4 pb-2 pt-1.5 border-transparent text-gray-400 hover:text-gray-700 -mb-[2px] border-2 border-b-0"
					on:click={() => (selected = t.id)}
				>
					{t.name}
				</button>
			{/if}
		{/each}
	</div>
	<slot />
</div>
