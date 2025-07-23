<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	export let choices: [string, string | number][];
	export let filtered_indices: number[];
	export let show_options = false;
	export let disabled = false;
	export let selected_indices: (string | number)[] = [];
	export let active_index: number | null = null;
	export let remember_scroll = false;
	export let offset_from_top = 0;
	export let from_top = false;

	let distance_from_top: number;
	let distance_from_bottom: number;
	let input_height: number;
	let input_width: number;
	let refElement: HTMLDivElement;
	let listElement: HTMLUListElement;
	let top: string | null, bottom: string | null, max_height: number;
	let innerHeight: number;
	let list_scroll_y = 0;

	function calculate_window_distance(): void {
		const { top: ref_top, bottom: ref_bottom } =
			refElement.getBoundingClientRect();
		if (from_top) {
			distance_from_top = offset_from_top;
		} else {
			distance_from_top = ref_top;
		}
		distance_from_bottom = innerHeight - ref_bottom;
	}

	let scroll_timeout: NodeJS.Timeout | null = null;
	function scroll_listener(): void {
		if (!show_options) return;
		if (scroll_timeout !== null) {
			clearTimeout(scroll_timeout);
		}

		scroll_timeout = setTimeout(() => {
			calculate_window_distance();
			scroll_timeout = null;
		}, 10);
	}

	function restore_last_scroll(): void {
		listElement?.scrollTo?.(0, list_scroll_y);
	}

	$: {
		if (show_options && refElement) {
			if (remember_scroll) {
				restore_last_scroll();
			} else {
				if (listElement && selected_indices.length > 0) {
					let elements = listElement.querySelectorAll("li");
					for (const element of Array.from(elements)) {
						if (
							element.getAttribute("data-index") ===
							selected_indices[0].toString()
						) {
							listElement?.scrollTo?.(0, (element as HTMLLIElement).offsetTop);
							break;
						}
					}
				}
			}
			calculate_window_distance();
			const rect = refElement.parentElement?.getBoundingClientRect();
			input_height = rect?.height || 0;
			input_width = rect?.width || 0;
		}
		if (distance_from_bottom > distance_from_top || from_top) {
			top = `${distance_from_top}px`;
			max_height = distance_from_bottom;
			bottom = null;
		} else {
			bottom = `${distance_from_bottom + input_height}px`;
			max_height = distance_from_top - input_height;
			top = null;
		}
	}

	const dispatch = createEventDispatcher();
</script>

<svelte:window on:scroll={scroll_listener} bind:innerHeight />

<div class="reference" bind:this={refElement} />
{#if show_options && !disabled}
	<ul
		class="options"
		transition:fly={{ duration: 200, y: 5 }}
		on:mousedown|preventDefault={(e) => dispatch("change", e)}
		on:scroll={(e) => (list_scroll_y = e.currentTarget.scrollTop)}
		style:top
		style:bottom
		style:max-height={`calc(${max_height}px - var(--window-padding))`}
		style:width={input_width + "px"}
		bind:this={listElement}
		role="listbox"
	>
		{#each filtered_indices as index}
			<li
				class="item"
				class:selected={selected_indices.includes(index)}
				class:active={index === active_index}
				class:bg-gray-100={index === active_index}
				class:dark:bg-gray-600={index === active_index}
				style:width={input_width + "px"}
				data-index={index}
				aria-label={choices[index][0]}
				data-testid="dropdown-option"
				role="option"
				aria-selected={selected_indices.includes(index)}
			>
				<span class:hide={!selected_indices.includes(index)} class="inner-item">
					✓
				</span>
				{choices[index][0]}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.options {
		--window-padding: var(--size-8);
		position: fixed;
		z-index: var(--layer-top);
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--container-radius);
		background: var(--background-fill-primary);
		min-width: fit-content;
		max-width: inherit;
		overflow: auto;
		color: var(--body-text-color);
		list-style: none;
	}

	.item {
		display: flex;
		cursor: pointer;
		padding: var(--size-2);
		word-break: break-word;
	}

	.item:hover,
	.active {
		background: var(--background-fill-secondary);
	}

	.inner-item {
		padding-right: var(--size-1);
	}

	.hide {
		visibility: hidden;
	}
</style>
