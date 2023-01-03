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
		$selected_tab = id;
		dispatch("change");
	}

	$: selected !== null && change_tab(selected);
	let h = 0;

	let bar: HTMLSpanElement;
	let active: HTMLButtonElement;
	let parent: HTMLDivElement;
	let scroll_container: HTMLDivElement;

	$: h && active && move_bar();

	async function move_bar() {
		await tick();
		const button = active.getBoundingClientRect();
		const parent_box = parent.getBoundingClientRect();

		bar.style.width = `${button.width - 4}px`;
		bar.style.left = `${button.left - parent_box.left + scroll_pos + 2}px`;
		bar.style.top = `${button.top - parent_box.top + button.height}px`;
	}

	let scroll_pos = 0;

	function handle_scroll(e: Event & { currentTarget: HTMLDivElement }) {
		scroll_pos = e.currentTarget.scrollLeft;
	}
</script>

<div
	class="tabs"
	class:hide={!visible}
	id={elem_id}
	bind:this={parent}
	bind:clientHeight={h}
>
	<span
		class="bar"
		bind:this={bar}
		style:transform="translateX(-{scroll_pos}px)"
	/>

	<div
		class="tab-nav scroll-hide"
		on:scroll={handle_scroll}
		bind:this={scroll_container}
	>
		{#each tabs as t, i (t.id)}
			{#if t.id === $selected_tab}
				<button class="selected" bind:this={active}>
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
		margin-top: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.hide {
		display: none;
	}

	.tab-nav {
		display: flex;
		position: relative;
		border-bottom: 2px solid var(--color-border-primary);
		overflow-x: scroll;
		white-space: nowrap;
	}

	button {
		position: relative;
		border: 2px solid transparent;
		border-color: transparent;
		border-bottom: none;
		border-top-right-radius: var(--radius-md);
		border-top-left-radius: var(--radius-md);
		padding: var(--size-1) var(--size-4);
		color: var(--color-text-subdued);
	}

	button:hover {
		color: var(--color-text-body);
	}
	.selected {
		position: sticky;
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
