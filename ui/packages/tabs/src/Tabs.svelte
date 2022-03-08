<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	interface Tab {
		name: string;
		id: object;
	}

	const tabs: Array<Tab> = [];

	const selected_tab = writable<false | object>(false);

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
</script>

<div class="flex flex-col">
	<div class="flex">
		{#each tabs as t, i}
			{#if t.id === $selected_tab}
				<button
					class="px-4 py-2 font-semibold border-2 border-b-0 rounded-t border-gray-200"
				>
					{t.name}
				</button>
			{:else}
				<button
					class="px-4 py-2 border-b-2 border-gray-200"
					on:click={() => {
						$selected_tab = t.id;
					}}
				>
					{t.name}
				</button>
			{/if}
		{/each}
		<div class="flex-1 border-b-2 border-gray-200" />
	</div>
	<slot />
</div>
