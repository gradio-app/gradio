<script context="module" lang="ts">
	import { TABS, type Tab } from "./Tabs.svelte";
</script>

<script lang="ts">
	import { setContext, createEventDispatcher, tick, onMount } from "svelte";
	import { writable } from "svelte/store";
	import type { SelectData } from "@gradio/utils";

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string;
	export let initial_tabs: Tab[];

	let tabs: (Tab | null)[] = [...initial_tabs];

	$: has_tabs = tabs.length > 0;

	const selected_tab = writable<false | number | string>(
		selected || tabs[0]?.id || false
	);
	const selected_tab_index = writable<number>(
		tabs.findIndex((t) => t?.id === selected) || 0
	);
	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	setContext(TABS, {
		register_tab: (tab: Tab, order: number) => {
			tabs[order] = tab;

			if ($selected_tab === false && tab.visible && tab.interactive) {
				$selected_tab = tab.id;
				$selected_tab_index = order;
			}
			return order;
		},
		unregister_tab: (tab: Tab, order: number) => {
			if ($selected_tab === tab.id) {
				$selected_tab = tabs[0]?.id || false;
			}
			tabs[order] = null;
		},
		selected_tab,
		selected_tab_index
	});

	function change_tab(id: string | number | undefined, index: number): void {
		const tab_to_activate = tabs.find((t) => t?.id === id);
		if (
			id !== undefined &&
			tab_to_activate &&
			tab_to_activate.interactive &&
			tab_to_activate.visible &&
			$selected_tab !== tab_to_activate.id
		) {
			selected = id;
			$selected_tab = id;
			$selected_tab_index = tabs.findIndex((t) => t?.id === id);
			dispatch("change");
		}
	}

	$: tabs,
		selected !== null &&
			change_tab(
				selected,
				tabs.findIndex((t) => t?.id === selected)
			);

	$: tab_scale =
		tabs[$selected_tab_index >= 0 ? $selected_tab_index : 0]?.scale;

	function get_step_status(
		tab: Tab | null,
		index: number
	): "active" | "completed" | "pending" {
		if (!tab) return "pending";
		if (index < $selected_tab_index) return "completed";
		if (index === $selected_tab_index) return "active";
		return "pending";
	}
</script>

<div
	class="stepper {elem_classes.join(' ')}"
	class:hide={!visible}
	id={elem_id}
	style:flex-grow={tab_scale}
>
	{#if has_tabs}
		<div class="stepper-wrapper">
			<div class="stepper-container" role="tablist">
				{#each tabs as t, i}
					{#if t?.visible}
						<div class="step-item">
							<button
								role="tab"
								class="step-button"
								class:active={t.id === $selected_tab}
								class:completed={t.id < $selected_tab}
								class:pending={t.id > $selected_tab}
								aria-selected={t.id === $selected_tab}
								aria-controls={t.elem_id}
								disabled={!t.interactive || i > $selected_tab_index}
								aria-disabled={!t.interactive || i > $selected_tab_index}
								id={t.elem_id ? t.elem_id + "-button" : null}
								data-tab-id={t.id}
								on:click={() => {
									if (i <= $selected_tab_index && t.id !== $selected_tab) {
										change_tab(t.id, i);
										dispatch("select", { value: t.label, index: i });
									}
								}}
							>
								<span class="step-number">
									{#if t.id < $selected_tab}
										<svg
											width="12"
											height="10"
											viewBox="0 0 12 10"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M1 5L4.5 8.5L11 1.5"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else}
										{i + 1}
									{/if}
								</span>
								<span class="step-label">
									{t?.label !== undefined ? t?.label : "Step " + (i + 1)}
								</span>
							</button>
						</div>
						{#if i < tabs.length - 1}
							<div
								class="step-connector"
								class:completed={i < $selected_tab_index}
							></div>
						{/if}
					{/if}
				{/each}
			</div>
		</div>
	{/if}
	<slot />
</div>

<style>
	.stepper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--layout-gap);
	}

	.hide {
		display: none;
	}

	.stepper-wrapper {
		display: flex;
		align-items: center;
		position: relative;
		padding: var(--size-4) 0;
	}

	.stepper-container {
		display: flex;
		align-items: center;
		width: 100%;
		position: relative;
		gap: var(--size-2);
	}

	.step-item {
		display: flex;
		align-items: center;
		flex: 1;
		position: relative;
	}

	.step-item:last-child {
		flex: 0;
	}

	.step-button {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2) var(--size-3);
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all 0.2s ease;
		font-size: var(--text-sm);
		color: var(--body-text-color-subdued);
		white-space: nowrap;
		z-index: 1;
		position: relative;
	}

	.step-button:hover:not(:disabled) {
		background-color: var(--background-fill-secondary);
	}

	.step-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.step-button.active {
		color: var(--body-text-color);
	}

	.step-button.completed {
		color: var(--body-text-color);
	}

	.step-button.pending {
		color: var(--body-text-color-subdued);
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.active .step-number {
		background-color: var(--color-accent);
		color: white;
		box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
	}

	.completed .step-number {
		background-color: var(--color-accent);
		color: white;
	}

	.pending .step-number {
		background-color: var(--background-fill-secondary);
		color: var(--body-text-color-subdued);
	}

	.step-label {
		display: none;

		font-size: var(--text-md);
		line-height: 1.5;
	}

	.step-connector {
		width: 100%;
		height: 1px;
		background-color: var(--border-color-primary);
		transition: background-color 0.3s ease;
		transform: translateY(1px);
	}

	.step-connector.completed {
		background-color: var(--color-accent);
	}

	@media (--screen-xs) {
		.step-label {
			display: block;
		}

		.step-button {
			padding: var(--size-1);
		}

		.step-connector {
			width: calc(100% - 32px);
			left: 100%;
		}
	}

	:global(.dark) .pending .step-number {
		background-color: var(--neutral-800);
		color: var(--neutral-400);
		border-color: var(--neutral-600);
	}

	:global(.dark) .step-connector {
		background-color: var(--neutral-600);
	}
</style>
