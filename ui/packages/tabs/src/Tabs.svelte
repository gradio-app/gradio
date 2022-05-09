<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext, createEventDispatcher } from "svelte";
	import { writable } from "svelte/store";

	interface Tab {
		name: string;
		id: object;
	}

	export let style: string = "";

	const tabs: Array<Tab> = [];

	const selected_tab = writable<false | object>(false);
	const dispatch = createEventDispatcher<{ change: undefined }>();

	setContext(TABS, {
		register_tab: (tab: Tab) => {
			tabs.push({ name: tab.name, id: tab.id });
			selected_tab.update((current) => current || tab.id);
		},
		unregister_tab: (tab: Tab) => {
			const i = tabs.findIndex((t) => t.id === tab.id);
			tabs.splice(i, 1);
			selected_tab.update((current) =>
				current === tab.id ? tabs[i].id || tabs[tabs.length - 1].id : current
			);
		},

		selected_tab
	});

	function handle_click(id: object) {
		$selected_tab = id;
		dispatch("change");
	}
</script>

<div class="tabs flex flex-col my-4">
	<div class="flex border-b-2">
		{#each tabs as t, i}
			{#if t.id === $selected_tab}
				<button
					class="bg-white px-4 pb-2 pt-1.5 rounded-t-lg border-gray-200 -mb-[2px] border-2 border-b-0"
				>
					{t.name}
				</button>
			{:else}
				<button
					class="px-4 pb-2 pt-1.5 border-transparent text-gray-400 hover:text-gray-700 -mb-[2px] border-2 border-b-0"
					on:click={() => handle_click(t.id)}
				>
					{t.name}
				</button>
			{/if}
		{/each}
	</div>
	<slot />
</div>
