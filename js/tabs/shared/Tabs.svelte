<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import {
		setContext,
		createEventDispatcher,
		onMount,
		onDestroy,
		tick,
	} from "svelte";
	import OverflowIcon from "./OverflowIcon.svelte";
	import { writable } from "svelte/store";
	import type { SelectData } from "@gradio/utils";

	interface Tab {
		name: string;
		id: string | number;
		elem_id: string | undefined;
		visible: boolean;
		interactive: boolean;
	}

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string;
	export let initial_tabs: Tab[];

	let tabs: Tab[] = [...initial_tabs];
	let visible_tabs: Tab[] = [...tabs];
	let overflow_tabs: Tab[] = [];
	let overflow_menu_open = false;
	let overflow_menu: HTMLElement;

	$: has_tabs = tabs.length > 0;
	$: console.log("tabs", tabs);

	let tab_nav_size: DOMRect;

	const selected_tab = writable<false | number | string>(
		selected || tabs[0]?.id || false,
	);
	const selected_tab_index = writable<number>(
		tabs.findIndex((t) => t.id === selected) || 0,
	);
	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	let is_overflowing = false;
	let overflow_has_selected_tab = false;
	let tab_els: Record<string | number, HTMLElement> = {};

	setContext(TABS, {
		register_tab: (tab: Tab) => {
			let index = tabs.findIndex((t) => t.id === tab.id);
			if (index !== -1) {
				tabs[index] = { ...tabs[index], ...tab };
			} else {
				tabs = [...tabs, tab];
				index = tabs.length - 1;
			}
			if ($selected_tab === false && tab.visible && tab.interactive) {
				$selected_tab = tab.id;
			}
			return index;
		},
		unregister_tab: (tab: Tab) => {
			const index = tabs.findIndex((t) => t.id === tab.id);
			if (index !== -1) {
				tabs = tabs.filter((t) => t.id !== tab.id);
				if ($selected_tab === tab.id) {
					$selected_tab = tabs[0]?.id || false;
				}
			}
		},
		selected_tab,
		selected_tab_index,
	});

	function change_tab(id: string | number): void {
		const tab_to_activate = tabs.find((t) => t.id === id);
		if (
			tab_to_activate &&
			tab_to_activate.interactive &&
			tab_to_activate.visible &&
			$selected_tab !== tab_to_activate.id
		) {
			selected = id;
			$selected_tab = id;
			$selected_tab_index = tabs.findIndex((t) => t.id === id);
			dispatch("change");
			overflow_menu_open = false;
		}
	}

	$: tabs, selected !== null && change_tab(selected);
	$: tabs, tab_nav_size, tab_els, handle_menu_overflow();

	onMount(() => {
		// handle_menu_overflow();

		// window.addEventListener("resize", handle_menu_overflow);
		window.addEventListener("click", handle_outside_click);
	});

	onDestroy(() => {
		if (typeof window === "undefined") return;
		// window.removeEventListener("resize", handle_menu_overflow);
		window.removeEventListener("click", handle_outside_click);
	});

	function handle_outside_click(event: MouseEvent): void {
		if (
			overflow_menu_open &&
			overflow_menu &&
			!overflow_menu.contains(event.target as Node)
		) {
			overflow_menu_open = false;
		}
	}

	async function handle_menu_overflow(): Promise<void> {
		if (!tab_nav_size) {
			console.error("Menu elements not found");
			return;
		}
		console.log("boo");

		await tick();

		let _visible_tabs: Tab[] = [];
		let _overflow_tabs: Tab[] = [];

		let max_width = tab_nav_size.width;
		let cumulative_width = 0;
		console.log({ max_width });
		const tab_sizes = get_tab_sizes(tabs, tab_els);
		console.log({ tab_sizes });
		tabs.forEach((tab, index) => {
			// const tab_menu_rect = tab_nav_el.getBoundingClientRect();
			const tab_rect = tab_sizes[tab.id];
			console.log({
				index,
				tab_rect,
				cumulative_width,
				max_width,
				comparison: tab_rect?.right > max_width,
			});
			if (!tab_rect && tab.visible) {
				_overflow_tabs.push(tab);
				return;
			} else if (!tab.visible) {
				return;
			}

			let overflowing = !!(tab_rect.right > max_width && tab && tab.visible);

			if (overflowing && tab && tab.visible) {
				_overflow_tabs.push(tab);
			} else if (tab && tab.visible) {
				_visible_tabs.push(tab);
			}
		});

		if (JSON.stringify(_overflow_tabs) !== JSON.stringify(overflow_tabs)) {
			overflow_tabs = _overflow_tabs;
		}
		if (JSON.stringify(_visible_tabs) !== JSON.stringify(visible_tabs)) {
			visible_tabs = _visible_tabs;
		}

		overflow_has_selected_tab = handle_overflow_has_selected_tab($selected_tab);
		console.log({ overflow_tabs, visible_tabs, is_overflowing });
		is_overflowing = overflow_tabs.length > 0;
	}

	$: overflow_has_selected_tab =
		handle_overflow_has_selected_tab($selected_tab);

	function handle_overflow_has_selected_tab(
		selected_tab: number | string | false,
	): boolean {
		if (selected_tab === false) return false;
		return overflow_tabs.some((t) => t.id === selected_tab);
	}

	function get_tab_sizes(
		tabs: Tab[],
		tab_els: Record<string | number, HTMLElement>,
	): Record<string | number, DOMRect> {
		const tab_sizes: Record<string | number, DOMRect> = {};
		tabs.forEach((tab) => {
			tab_sizes[tab.id] = tab_els[tab.id]?.getBoundingClientRect();
		});
		return tab_sizes;
	}
</script>

{#if has_tabs}
	<div class="tabs {elem_classes.join(' ')}" class:hide={!visible} id={elem_id}>
		<div class="tab-wrapper">
			<div class="tab-container" bind:contentRect={tab_nav_size} role="tablist">
				{#each visible_tabs as t, i (t.id)}
					{#if t.visible}
						<button
							role="tab"
							class:selected={t.id === $selected_tab}
							aria-selected={t.id === $selected_tab}
							aria-controls={t.elem_id}
							disabled={!t.interactive}
							aria-disabled={!t.interactive}
							id={t.elem_id ? t.elem_id + "-button" : null}
							data-tab-id={t.id}
							bind:this={tab_els[t.id]}
							on:click={() => {
								if (t.id !== $selected_tab) {
									change_tab(t.id);
									dispatch("select", { value: t.name, index: i });
								}
							}}
						>
							{t.name}
						</button>
					{/if}
				{/each}
			</div>
			<span
				class="overflow-menu"
				class:hide={!is_overflowing}
				bind:this={overflow_menu}
			>
				<button
					on:click|stopPropagation={() =>
						(overflow_menu_open = !overflow_menu_open)}
					class:overflow-item-selected={overflow_has_selected_tab}
				>
					<OverflowIcon />
				</button>
				<div class="overflow-dropdown" class:hide={!overflow_menu_open}>
					{#each overflow_tabs as t}
						<button
							on:click={() => change_tab(t.id)}
							class:selected={t.id === $selected_tab}
						>
							{t.name}
						</button>
					{/each}
				</div>
			</span>
		</div>
	</div>
{/if}

<slot />

<style>
	.tabs {
		position: relative;
	}

	.hide {
		display: none;
	}

	.tab-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		height: var(--size-8);
		padding-bottom: var(--size-2);
	}

	.tab-container {
		display: flex;
		align-items: center;
		width: 100%;
		position: relative;
		overflow: hidden;
		height: var(--size-8);
	}

	.tab-container::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background-color: var(--border-color-primary);
	}

	.overflow-menu {
		flex-shrink: 0;
		margin-left: var(--size-2);
	}

	button {
		margin-bottom: 0;
		border: none;
		border-radius: 0;
		padding: 0 var(--size-4);
		color: var(--body-text-color);
		font-weight: var(--section-header-text-weight);
		font-size: var(--section-header-text-size);
		transition: all 0.2s ease-out;
		background-color: transparent;
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
		position: relative;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:hover:not(:disabled):not(.selected) {
		background-color: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.selected {
		background-color: transparent;
		color: var(--color-accent);
		position: relative;
	}

	.selected::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: var(--color-accent);
		animation: fade-grow 0.2s ease-out forwards;
		transform-origin: center;
		z-index: 1;
	}

	@keyframes fade-grow {
		from {
			opacity: 0;
			transform: scaleX(0.8);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	.overflow-dropdown {
		position: absolute;
		top: calc(100% + var(--size-2));
		right: 0;
		background-color: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		z-index: var(--layer-5);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: var(--size-2);
		min-width: 150px;
		width: max-content;
	}

	.overflow-dropdown button {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--size-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.overflow-menu > button {
		padding: var(--size-1) var(--size-2);
		min-width: auto;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.overflow-menu > button:hover {
		background-color: var(--background-fill-secondary);
	}

	.overflow-menu :global(svg) {
		width: 16px;
		height: 16px;
	}

	.overflow-item-selected :global(svg) {
		color: var(--color-accent);
	}
</style>
