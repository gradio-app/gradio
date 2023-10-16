<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import { setContext, createEventDispatcher, tick } from "svelte";
	import { writable } from "svelte/store";
	import type { SelectData } from "@gradio/utils";

	interface Tab {
		name: string;
		id: object;
		elem_id: string | undefined;
	}

	export let visible = true;
	export let elem_id = "id";
	export let elem_classes: string[] = [];
	export let selected: number | string | object;

	let tabs: Tab[] = [];

	const selected_tab = writable<false | object | number | string>(false);
	const selected_tab_index = writable<number>(0);
	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	setContext(TABS, {
		register_tab: (tab: Tab) => {
			tabs.push({ name: tab.name, id: tab.id, elem_id: tab.elem_id });
			selected_tab.update((current) => current ?? tab.id);
			tabs = tabs;
			return tabs.length - 1;
		},
		unregister_tab: (tab: Tab) => {
			const i = tabs.findIndex((t) => t.id === tab.id);
			tabs.splice(i, 1);
			selected_tab.update((current) =>
				current === tab.id ? tabs[i]?.id || tabs[tabs.length - 1]?.id : current
			);
		},
		selected_tab,
		selected_tab_index
	});

	function change_tab(id: object | string | number): void {
		selected = id;
		$selected_tab = id;
		$selected_tab_index = tabs.findIndex((t) => t.id === id);
		dispatch("change");
	}

	$: selected !== null && change_tab(selected);
</script>

<div class="tabs {elem_classes.join(' ')}" class:hide={!visible} id={elem_id}>
	<div class="tab-nav scroll-hide">
		{#each tabs as t, i (t.id)}
			{#if t.id === $selected_tab}
				<button class="selected" id={t.elem_id ? t.elem_id + "-button" : null}>
					{t.name}
				</button>
			{:else}
				<button
					id={t.elem_id ? t.elem_id + "-button" : null}
					on:click={() => {
						change_tab(t.id);
						dispatch("select", { value: t.name, index: i });
					}}
				>
					{t.name}
				</button>
			{/if}
		{/each}
	</div>
	<slot />
</div>

<style>
	.tabs {
		position: relative;
	}

	.hide {
		display: none;
	}

	.tab-nav {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--border-color-primary);
	}

	button {
		margin-bottom: -1px;
		border: 1px solid transparent;
		border-color: transparent;
		border-bottom: none;
		border-top-right-radius: var(--container-radius);
		border-top-left-radius: var(--container-radius);
		padding: var(--size-1) var(--size-4);
		color: var(--body-text-color-subdued);
		font-weight: var(--section-header-text-weight);
		font-size: var(--section-header-text-size);
	}

	button:hover {
		color: var(--body-text-color);
	}
	.selected {
		border-color: var(--border-color-primary);
		background: var(--background-fill-primary);
		color: var(--body-text-color);
	}

	.bar {
		display: block;
		position: absolute;
		bottom: -2px;
		left: 0;
		z-index: 999;
		background: var(--background-fill-primary);
		width: 100%;
		height: 2px;
		content: "";
	}
</style>
