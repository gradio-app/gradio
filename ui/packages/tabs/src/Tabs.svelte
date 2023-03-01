<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext, createEventDispatcher, tick } from "svelte";
	import { writable } from "svelte/store";

	interface Tab {
		name: string;
		id: object;
	}

	export let visible: boolean = true;
	export let elem_id: string = "id";
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
		selected = id;
		$selected_tab = id;
		dispatch("change");
	}

	$: selected !== null && change_tab(selected);
</script>

<div class="tabs" class:hide={!visible} id={elem_id}>
	<div class="tab-nav scroll-hide">
		{#each tabs as t, i (t.id)}
			{#if t.id === $selected_tab}
				<button class="selected">
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
		position: relative;
		flex-direction: column;
	}

	.hide {
		display: none;
	}

	.tab-nav {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--color-border-primary);
		white-space: nowrap;
	}

	button {
		margin-bottom: -1px;
		border: 1px solid transparent;
		border-color: transparent;
		border-bottom: none;
		border-top-right-radius: var(--container-radius);
		border-top-left-radius: var(--container-radius);
		padding: var(--size-1) var(--size-4);
		color: var(--color-text-subdued);
		font-weight: var(--section-text-weight);
		font-size: var(--section-text-size);
	}

	button:hover {
		color: var(--color-text-body);
	}
	.selected {
		border-color: var(--color-border-primary);
		background-color: var(--color-background-primary);
		color: var(--color-text-body);
	}

	.bar {
		display: block;
		position: absolute;
		bottom: -2px;
		left: 0;
		z-index: 999;
		background-color: var(--color-background-primary);
		width: 100%;
		height: 2px;
		content: "";
	}
</style>
