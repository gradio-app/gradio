<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import {
		setContext,
		createEventDispatcher,
		onMount,
		onDestroy
	} from "svelte";
	import OverflowIcon from "./OverflowIcon.svelte";
	import { writable } from "svelte/store";
	import type { SelectData } from "@gradio/utils";

	interface Tab {
		name: string;
		id: object;
		elem_id: string | undefined;
		visible: boolean;
		interactive: boolean;
	}

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string | object;

	let tabs: Tab[] = [];
	let overflow_menu_open = false;
	let overflow_menu: HTMLElement;

	$: has_tabs = tabs.length > 0;

	let tab_nav_el: HTMLElement;
	let overflow_nav: HTMLElement;

	const selected_tab = writable<false | object | number | string>(false);
	const selected_tab_index = writable<number>(0);
	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	let is_overflowing = false;
	let overflow_has_selected_tab = false;

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
		selected_tab_index
	});

	function change_tab(id: object | string | number): void {
		const tab_to_activate = tabs.find((t) => t.id === id);
		if (
			tab_to_activate &&
			tab_to_activate.interactive &&
			tab_to_activate.visible
		) {
			selected = id;
			$selected_tab = id;
			$selected_tab_index = tabs.findIndex((t) => t.id === id);
			dispatch("change");
			overflow_menu_open = false;
		} else {
			console.warn("Attempted to select a non-interactive or hidden tab.");
		}
	}

	$: tabs, selected !== null && change_tab(selected);

	onMount(() => {
		handle_menu_overflow();

		window.addEventListener("resize", handle_menu_overflow);
		window.addEventListener("click", handle_outside_click);
	});

	onDestroy(() => {
		if (typeof window === "undefined") return;
		window.removeEventListener("resize", handle_menu_overflow);
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

	function handle_menu_overflow(): void {
		if (!tab_nav_el) {
			console.error("Menu elements not found");
			return;
		}

		let all_items: HTMLElement[] = [];

		[tab_nav_el, overflow_nav].forEach((menu) => {
			Array.from(menu.querySelectorAll("button")).forEach((item) =>
				all_items.push(item as HTMLElement)
			);
		});

		all_items.forEach((item) => tab_nav_el.appendChild(item));

		const nav_items: HTMLElement[] = [];
		const overflow_items: HTMLElement[] = [];

		Array.from(tab_nav_el.querySelectorAll("button")).forEach((item) => {
			const tab_rect = item.getBoundingClientRect();
			const tab_menu_rect = tab_nav_el.getBoundingClientRect();
			is_overflowing =
				tab_rect.right > tab_menu_rect.right ||
				tab_rect.left < tab_menu_rect.left;

			if (is_overflowing) {
				overflow_items.push(item as HTMLElement);
			} else {
				nav_items.push(item as HTMLElement);
			}
		});

		nav_items.forEach((item) => tab_nav_el.appendChild(item));
		overflow_items.forEach((item) => overflow_nav.appendChild(item));

		overflow_has_selected_tab = tabs.some(
			(t) =>
				t.id === $selected_tab &&
				overflow_nav.contains(document.querySelector(`[data-tab-id="${t.id}"]`))
		);
	}
</script>

{#if has_tabs}
	<div class="tabs {elem_classes.join(' ')}" class:hide={!visible} id={elem_id}>
		<div class="tab-wrapper">
			<div class="tab-container" bind:this={tab_nav_el} role="tablist">
				{#each tabs as t, i (t.id)}
					<button
						role="tab"
						class:selected={t.id === $selected_tab}
						aria-selected={t.id === $selected_tab}
						aria-controls={t.elem_id}
						disabled={!t.interactive}
						aria-disabled={!t.interactive}
						id={t.elem_id ? t.elem_id + "-button" : null}
						data-tab-id={t.id}
						on:click={() => {
							if (t.id !== $selected_tab) {
								change_tab(t.id);
								dispatch("select", { value: t.name, index: i });
							}
						}}
					>
						{t.name}
					</button>
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
				<div
					class="overflow-dropdown"
					bind:this={overflow_nav}
					class:hide={!overflow_menu_open}
				/>
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
