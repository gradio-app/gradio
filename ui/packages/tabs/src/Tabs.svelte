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

	export let visible: boolean = true;
	export let elem_id: string = "id";
	export let selected: number | string | object = 0;

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

<div class="tabs" class:hide={!visible} id={elem_id}>
	<div class="tab-nav ">
		{#each tabs as t (t.id)}
			{#if t.id === $selected_tab}
				<button class="selected ">
					{t.name}
				</button>
			{:else}
				<button on:click={() => change_tab(t.id)}>
					{t.name}
				</button>
			{/if}
		{/each}
	</div>
	<slot />
</div>

<style>
	.tabs {
		display: flex;
		flex-direction: column;
		margin-top: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.hide {
		display: none;
	}

	.tab-nav {
		display: flex;
		border-bottom: 2px solid var(--color-border-primary);
	}

	button {
		color: var(--color-text-subdued);
		padding: var(--size-1) var(--size-4);
		border-top-right-radius: var(--radius-md);
		border-top-left-radius: var(--radius-md);
		border: 2px solid transparent;
		border-color: transparent;
		border-bottom: none;

		margin-bottom: -2px;
	}

	button:hover {
		color: var(--color-text-body);
	}
	.selected {
		border-color: var(--color-border-primary);
		background-color: var(--color-background-primary);
		color: var(--color-text-body);
	}
</style>
