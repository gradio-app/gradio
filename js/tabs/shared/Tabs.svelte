<script context="module" lang="ts">
	import type { SelectData } from "@gradio/utils";

	export const TABS = {};

	export interface Tab {
		label: string;
		id: string | number;
		elem_id: string | undefined;
		visible: boolean | "hidden";
		interactive: boolean;
		scale: number | null;
		component_id: number;
	}

	export type TabSelectData = Omit<SelectData, "index"> & {
		index: number;
		id: string | number;
		component_id: number;
	};

	function is_visible_tab(tab: Tab | null | undefined): tab is Tab {
		return !!tab && tab.visible !== false && tab.visible !== "hidden";
	}

	function find_tab_index(tabs: (Tab | null)[], id: string | number): number {
		const index = tabs.findIndex((t) => t?.id === id);
		return index === -1 ? 0 : index;
	}
</script>

<script lang="ts">
	import { setContext, tick, untrack } from "svelte";
	import OverflowIcon from "./OverflowIcon.svelte";
	import { writable } from "svelte/store";

	let {
		visible = true,
		elem_id = "",
		elem_classes = [],
		selected = $bindable(),
		initial_tabs,
		onchange,
		onselect
	}: {
		visible?: boolean | "hidden";
		elem_id?: string;
		elem_classes?: string[];
		selected: number | string;
		initial_tabs: Tab[];
		onchange?: () => void;
		onselect?: (data: TabSelectData) => void;
	} = $props();

	let tabs = $state<(Tab | null)[]>([...initial_tabs]);
	let visible_tabs = $state<(Tab | null)[]>([...initial_tabs]);
	let overflow_tabs = $state<(Tab | null)[]>([]);
	let overflow_menu_open = $state(false);
	let overflow_menu: HTMLElement;

	let mounted_tab_orders = new Set<number>();

	$effect(() => {
		const new_tabs = initial_tabs;
		untrack(() => _sync_tabs(new_tabs));
	});

	function _sync_tabs(new_tabs: Tab[]): void {
		tick().then(() => {
			untrack(() => {
				for (let i = 0; i < new_tabs.length; i++) {
					if (new_tabs[i] && !mounted_tab_orders.has(i)) {
						tabs[i] = new_tabs[i];
					}
				}
				handle_menu_overflow();
			});
		});
	}

	let has_tabs = $derived(tabs.length > 0);

	let tab_nav_el: HTMLDivElement;

	const selected_tab = writable<false | number | string>(
		selected ?? tabs[0]?.id ?? false
	);
	const selected_tab_index = writable<number>(find_tab_index(tabs, selected));

	let is_overflowing = $state(false);
	let overflow_has_selected_tab = $state(false);
	let tab_els: Record<string | number, HTMLElement> = $state({});

	function sync_tab_entry(tab: Tab, order: number): void {
		tabs[order] = tab;
		visible_tabs = visible_tabs.map((t) => (t?.id === tab.id ? tab : t));
		overflow_tabs = overflow_tabs.map((t) => (t?.id === tab.id ? tab : t));
	}

	setContext(TABS, {
		register_tab: (tab: Tab, order: number) => {
			mounted_tab_orders.add(order);
			sync_tab_entry(tab, order);

			if ($selected_tab === false && is_visible_tab(tab) && tab.interactive) {
				$selected_tab = tab.id;
				$selected_tab_index = order;
			} else if ($selected_tab === tab.id) {
				$selected_tab_index = order;
			}
			handle_menu_overflow();
			return order;
		},
		unregister_tab: (tab: Tab, order: number) => {
			mounted_tab_orders.delete(order);
			if ($selected_tab === tab.id) {
				$selected_tab = tabs[0]?.id ?? false;
			}
			tabs[order] = null;
			visible_tabs = visible_tabs.filter((t) => t?.id !== tab.id);
			overflow_tabs = overflow_tabs.filter((t) => t?.id !== tab.id);
			handle_menu_overflow();
		},
		selected_tab,
		selected_tab_index
	});

	function change_tab(id: string | number | undefined): void {
		const tab_to_activate = tabs.find((t) => t?.id === id);
		if (
			id !== undefined &&
			tab_to_activate &&
			tab_to_activate.interactive &&
			is_visible_tab(tab_to_activate) &&
			$selected_tab !== tab_to_activate.id
		) {
			selected = id;
			$selected_tab = id;
			$selected_tab_index = tabs.findIndex((t) => t?.id === id);
			onchange?.();
			overflow_menu_open = false;
		}
	}

	$effect(() => {
		if (selected !== null) change_tab(selected);
	});

	$effect(() => {
		if (!tab_nav_el) return;
		handle_menu_overflow();
		const ro = new ResizeObserver(() => {
			handle_menu_overflow();
		});
		ro.observe(tab_nav_el);
		return () => ro.disconnect();
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

	const OVERFLOW_BTN_RESERVE = 48;

	async function handle_menu_overflow(): Promise<void> {
		if (!tab_nav_el) return;

		await tick();
		await new Promise((r) => requestAnimationFrame(r));

		if (!tab_nav_el) return;

		const available = tab_nav_el.clientWidth;

		let cumulative = 0;
		let split_index = tabs.length;

		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (!is_visible_tab(tab)) continue;
			const el = tab_els[tab.id];
			if (!el) continue;
			cumulative += el.getBoundingClientRect().width;
			const has_more = tabs.slice(i + 1).some((t) => is_visible_tab(t));
			const limit = has_more ? available - OVERFLOW_BTN_RESERVE : available;
			if (cumulative > limit) {
				split_index = i;
				break;
			}
		}

		visible_tabs = tabs.slice(0, split_index);
		overflow_tabs = tabs.slice(split_index);

		overflow_has_selected_tab = handle_overflow_has_selected_tab($selected_tab);
		is_overflowing = overflow_tabs.filter((t) => is_visible_tab(t)).length > 0;
	}

	$effect(() => {
		overflow_has_selected_tab = handle_overflow_has_selected_tab($selected_tab);
	});

	function handle_overflow_has_selected_tab(
		selected_tab_value: number | string | false
	): boolean {
		if (selected_tab_value === false) return false;
		return overflow_tabs.some((t) => t?.id === selected_tab_value);
	}

	let tab_scale = $derived(
		tabs[$selected_tab_index >= 0 ? $selected_tab_index : 0]?.scale
	);
</script>

<svelte:window onresize={handle_menu_overflow} onclick={handle_outside_click} />

<div
	class="tabs {elem_classes.join(' ')}"
	class:hide={visible === false}
	class:hidden={visible === "hidden"}
	id={elem_id}
	style:flex-grow={tab_scale}
>
	{#if has_tabs}
		<div class="tab-wrapper">
			<div class="tab-container visually-hidden" aria-hidden="true">
				{#each tabs as t, i}
					{#if is_visible_tab(t)}
						<button tabindex="-1" bind:this={tab_els[t.id]}>
							{t?.label}
						</button>
					{/if}
				{/each}
			</div>
			<div class="tab-container" bind:this={tab_nav_el} role="tablist">
				{#each visible_tabs as t, i}
					{#if is_visible_tab(t)}
						<button
							role="tab"
							class:selected={t.id === $selected_tab}
							aria-selected={t.id === $selected_tab}
							aria-controls={t.elem_id}
							disabled={!t.interactive}
							aria-disabled={!t.interactive}
							id={t.elem_id ? t.elem_id + "-button" : null}
							data-tab-id={t.id}
							onclick={() => {
								if (t.id !== $selected_tab) {
									change_tab(t.id);
									onselect?.({
										value: t.label,
										index: i,
										id: t.id,
										component_id: t.component_id
									});
								}
							}}
						>
							{t?.label !== undefined ? t?.label : "Tab " + (i + 1)}
						</button>
					{/if}
				{/each}
			</div>
			<span
				class="overflow-menu"
				class:hide={!is_overflowing ||
					!overflow_tabs.some((t) => is_visible_tab(t))}
				bind:this={overflow_menu}
			>
				<button
					aria-label="More tabs"
					onclick={(e) => {
						e.stopPropagation();
						overflow_menu_open = !overflow_menu_open;
					}}
					class:overflow-item-selected={overflow_has_selected_tab}
				>
					<OverflowIcon />
				</button>
				<div class="overflow-dropdown" class:hide={!overflow_menu_open}>
					{#each overflow_tabs as t, i}
						{#if is_visible_tab(t)}
							<button
								onclick={() => {
									change_tab(t?.id);
									onselect?.({
										value: t.label,
										index: i,
										id: t.id,
										component_id: t.component_id
									});
								}}
								class:selected={t?.id === $selected_tab}
							>
								{t?.label}
							</button>
						{/if}
					{/each}
				</div>
			</span>
		</div>
	{/if}
	<slot />
</div>

<style>
	.tabs {
		position: relative;
		flex-direction: column;
	}

	.hide {
		display: none;
	}

	.hidden {
		display: none !important;
	}

	.tab-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		height: var(--size-8);
		padding-bottom: var(--size-2);
		margin-bottom: var(--layout-gap);
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
		transition: background-color color 0.2s ease-out;
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

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
