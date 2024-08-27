<script context="module">
	export const TABS = {};
</script>

<script lang="ts">
	import {
		setContext,
		createEventDispatcher,
		onMount,
		afterUpdate
	} from "svelte";
	import { writable } from "svelte/store";
	import type { SelectData } from "@gradio/utils";
	import { tick } from "svelte";

	interface Tab {
		name: string;
		id: object;
		elem_id: string | undefined;
		visible: boolean;
		interactive: boolean;
	}

	export let visible = true;
	export let elem_id = "id";
	export let elem_classes: string[] = [];
	export let selected: number | string | object;

	let tabs: Tab[] = [];
	let visible_tabs: Tab[] = [];
	let overflow_tabs: Tab[] = [];
	let show_overflow_menu = false;
	let overflow_menu_open = false;
	let tab_nav_ref: HTMLElement | null = null;
	let more_button_ref: HTMLElement | null = null;
	let resize_observer: ResizeObserver;
	let tab_buttons: HTMLButtonElement[] = [];

	$: has_tabs = tabs.length > 0;

	const selected_tab = writable<false | object | number | string>(false);
	const selected_tab_index = writable<number>(0);
	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
		overflow: { overflow_tabs: Tab[] };
	}>();

	setContext(TABS, {
		register_tab: (tab: Tab) => {
			let index: number;
			let existingTab = tabs.find((t) => t.id === tab.id);
			if (existingTab) {
				// update existing tab with newer values
				index = tabs.findIndex((t) => t.id === tab.id);
				tabs[index] = { ...tabs[index], ...tab };
			} else {
				tabs.push({
					name: tab.name,
					id: tab.id,
					elem_id: tab.elem_id,
					visible: tab.visible,
					interactive: tab.interactive
				});
				index = tabs.length - 1;
			}
			selected_tab.update((current) => {
				if (current === false && tab.visible && tab.interactive) {
					return tab.id;
				}

				let nextTab = tabs.find((t) => t.visible && t.interactive);
				return nextTab ? nextTab.id : current;
			});
			tabs = tabs;
			return index;
		},
		unregister_tab: (tab: Tab) => {
			const i = tabs.findIndex((t) => t.id === tab.id);
			tabs.splice(i, 1);
			selected_tab.update((current) =>
				current === tab.id ? tabs[i]?.id || tabs[tabs.length - 1]?.id : current
			);
			tabs = tabs;
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
			update_tab_visibility();
		} else {
			console.warn("Attempted to select a non-interactive or hidden tab.");
		}
	}

	$: tabs, tick().then(update_tab_visibility);

	let tab_container: HTMLElement;
	let overflow_button: HTMLElement;
	let initial_render = true;
	let tabs_width = 0;

	function debounce<T extends any[]>(
		func: (...args: T) => Promise<unknown>,
		timeout: number
	): (...args: T) => void {
		let timer: any;
		return function (...args: any) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, timeout);
		};
	}

	const update_tab_visibility = debounce((): void => {
		if (!tab_container || !overflow_button) return;

		const container_width = tab_container.offsetWidth;
		if (container_width === tabs_width && !initial_render) return;
		tabs_width = container_width;

		let current_width = 0;
		visible_tabs = [];
		overflow_tabs = [];
		const buffer = 20;
		const overflow_button_width = overflow_button.offsetWidth;
		const selected_tab_extra_width = 20;

		for (let tab of tabs) {
			const tab_element = tab_container.querySelector(
				`[data-tab-id="${tab.id}"]`
			) as HTMLElement;

			if (!tab_element) continue;

			const tab_width =
				tab_element.offsetWidth +
				(tab.id === $selected_tab ? selected_tab_extra_width : 0);

			if (
				current_width + tab_width + overflow_button_width + buffer <=
				container_width
			) {
				visible_tabs.push(tab);
				current_width += tab_width;
			} else {
				overflow_tabs.push(tab);
				overflow_tabs = overflow_tabs.concat(tabs.slice(tabs.indexOf(tab) + 1));
				break;
			}
		}

		show_overflow_menu = overflow_tabs.length > 0;
		overflow_menu_open = false;
		initial_render = false;
	}, 100);

	onMount(() => {
		let observer: ResizeObserver;

		const setup_observer = (): void => {
			if (tab_container) {
				update_tab_visibility();
				observer = new ResizeObserver(() => {
					update_tab_visibility();
				});
				observer.observe(tab_container);
			} else {
				setTimeout(setup_observer, 100);
			}
		};

		setup_observer();

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});
</script>

{#if has_tabs}
	<div class="tabs {elem_classes.join(' ')}" class:hide={!visible} id={elem_id}>
		<div class="tab-container">
			<div class="tab-nav-container" bind:this={tab_container}>
				<div class="tab-nav scroll-hide" role="tablist">
					{#each tabs as t, i (t.id)}
						<button
							role="tab"
							class:selected={t.id === $selected_tab}
							class:hidden={!initial_render && !visible_tabs.includes(t)}
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
			</div>
			<div class="overflow-menu" bind:this={overflow_button}>
				{#if show_overflow_menu}
					<button on:click={() => (overflow_menu_open = !overflow_menu_open)}>
						•••
					</button>
					{#if overflow_menu_open}
						<div class="overflow-dropdown">
							{#each overflow_tabs as t}
								<button
									on:click={() => {
										change_tab(t.id);
										dispatch("select", {
											value: t.name,
											index: tabs.indexOf(t)
										});
										overflow_menu_open = false;
									}}
								>
									{t.name}
								</button>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<div>
	<slot />
</div>

<style>
	.tabs {
		position: relative;
	}

	.tab-container {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.tab-nav-container {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.tab-nav {
		display: flex;
		position: relative;
		flex-wrap: nowrap;
		overflow: hidden;
		border-bottom: none;
		gap: var(--size-1);
		flex-grow: 1;
		margin-right: var(--spacing-lg);
		height: var(--size-8);
		padding-bottom: var(--size-2);
	}

	.tab-nav::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background-color: var(--border-color-primary);
	}

	.tab-nav_container {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.overflow-menu {
		position: relative;
		flex-shrink: 0;
		display: inline-block;
		margin-left: var(--size-2);
	}

	.overflow-menu.show {
		display: inline-block;
	}

	.overflow-menu > button {
		padding: var(--size-1) var(--size-2);
		min-width: auto;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
	}

	.overflow-menu > button:hover {
		background-color: var(--background-fill-secondary);
	}

	button {
		margin-bottom: 0;
		border: none;
		border-radius: var(--radius-sm);
		padding: 0 var(--size-4);
		color: var(--body-text-color-subdued);
		font-weight: var(--section-header-text-weight);
		font-size: var(--section-header-text-size);
		transition: all 0.2s ease-out;
		background-color: transparent;
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:hover:not(:disabled):not(.selected) {
		background-color: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.tab-nav .selected {
		background-color: var(--color-accent);
		color: white;
		border-radius: var(--radius-sm);
		transition: all 0.2s ease-out;
	}

	.overflow-dropdown {
		position: absolute;
		top: calc(100% + var(--size-2));
		right: 0;
		background-color: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		z-index: 1;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: var(--size-2);
		min-width: 150px;
		width: max-content;
		z-index: var(--layer-5);
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

	.hidden {
		display: none;
	}
</style>
