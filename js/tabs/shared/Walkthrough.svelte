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
	let stepper_container: HTMLDivElement;
	let show_labels_for_all = true;
	let measurement_container: HTMLDivElement;
	let step_labels: HTMLSpanElement[] = [];
	let label_height = 0;
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

	async function check_overflow(): Promise<void> {
		if (!stepper_container || !measurement_container) return;

		await tick();

		// First, show all labels to measure
		show_labels_for_all = true;
		await tick();

		// Measure if content fits
		const containerWidth = stepper_container.getBoundingClientRect().width;
		const contentWidth = measurement_container.scrollWidth;

		let max_height = 0;
		let is_overlapping = false;
		let last_right = false;

		for (const label of step_labels) {
			const { height, width, left, right } = label.getBoundingClientRect();
			if (height > max_height) {
				max_height = height;
			}
			console.log({ left, right, last_right, is_overlapping });
			if (last_right && left - 0 < last_right && !is_overlapping) {
				is_overlapping = true;
			}
			last_right = right;
		}
		label_height = max_height;

		console.log({ max_height, containerWidth, contentWidth });

		// If content doesn't fit, hide non-active labels
		if (is_overlapping) {
			show_labels_for_all = false;
		}
	}

	onMount(() => {
		check_overflow();

		const observer = new ResizeObserver(() => {
			check_overflow();
		});

		if (stepper_container) {
			observer.observe(stepper_container);
		}

		return () => {
			observer.disconnect();
		};
	});

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
	$: tabs, check_overflow();
	$: $selected_tab_index, check_overflow();

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

<svelte:window on:resize={check_overflow} />

<div
	class="stepper {elem_classes.join(' ')}"
	class:hide={!visible}
	id={elem_id}
	style:flex-grow={tab_scale}
>
	{#if has_tabs}
		<div
			class="stepper-wrapper"
			bind:this={stepper_container}
			style:--label-height={label_height + "px"}
		>
			<div
				class="stepper-container"
				bind:this={measurement_container}
				role="tablist"
			>
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
								<!-- {#if show_labels_for_all || i === $selected_tab_index} -->
								<span
									bind:this={step_labels[i]}
									class="step-label"
									class:visible={show_labels_for_all ||
										i === $selected_tab_index}
								>
									{t?.label !== undefined ? t?.label : "Step " + (i + 1)}
								</span>
								<!-- {/if} -->
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
		padding-top: var(--size-4);
		padding-bottom: calc(var(--label-height) + var(--size-4));
	}

	.stepper-container {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
		position: relative;
	}

	.step-item {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1 1 0;
		position: relative;
	}

	.step-button {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-1);
		padding: var(--size-2);
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
		/* font-weight: var(--weight-semibold); */
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
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: var(--text-sm);
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
		border: 2px solid var(--border-color-primary);
	}

	.step-label {
		font-size: var(--text-md);
		line-height: 1.2;
		text-align: center;
		max-width: 120px;
		position: absolute;
		bottom: -20px;
		display: none;
	}

	.step-label.visible {
		display: block;
	}

	.step-connector {
		/* position: absolute; */
		/* left: 50%; */
		width: 100%;
		height: 2px;
		background-color: var(--border-color-primary);
		transition: background-color 0.3s ease;
		/* top: 16px; */
		z-index: 0;
		transform: translate(0, 23px);
	}

	.step-connector.completed {
		background-color: var(--color-accent);
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
