<script lang="ts">
	import { fly } from "svelte/transition";

	const VIRTUALIZE_THRESHOLD = 200;
	const OPTION_HEIGHT = 32;
	const OVERSCAN = 8;

	let {
		choices,
		filtered_indices,
		show_options = false,
		disabled = false,
		selected_indices = [],
		active_index = null,
		remember_scroll = false,
		offset_from_top = 0,
		from_top = false,
		onchange,
		onload
	}: {
		choices: [string, string | number][];
		filtered_indices: number[];
		show_options: boolean;
		disabled?: boolean;
		selected_indices?: (string | number)[];
		active_index: number | null;
		remember_scroll?: boolean;
		offset_from_top?: number;
		from_top?: boolean;
		onchange?: (index: any) => void;
		onload?: () => void;
	} = $props();

	let distance_from_top = $state(0);
	let distance_from_bottom = $state(0);
	let input_height = $state(0);
	let input_width = $state(0);
	let refElement: HTMLDivElement;
	let listElement: HTMLUListElement;
	let top: string | null = $state(null);
	let bottom: string | null = $state(null);
	let max_height: number = $state(0);
	let innerHeight = $state(0);
	let list_scroll_y = $state(0);

	let use_virtual = $derived(filtered_indices.length > VIRTUALIZE_THRESHOLD);
	let virtual_count = $derived(
		Math.ceil(Math.max(max_height, OPTION_HEIGHT) / OPTION_HEIGHT) +
			OVERSCAN * 2
	);
	let virtual_start = $derived(
		use_virtual
			? Math.max(0, Math.floor(list_scroll_y / OPTION_HEIGHT) - OVERSCAN)
			: 0
	);
	let virtual_end = $derived(
		use_virtual
			? Math.min(filtered_indices.length, virtual_start + virtual_count)
			: filtered_indices.length
	);
	let visible_indices = $derived(
		use_virtual
			? filtered_indices.slice(virtual_start, virtual_end)
			: filtered_indices
	);
	let virtual_total_height = $derived(filtered_indices.length * OPTION_HEIGHT);
	let virtual_offset = $derived(virtual_start * OPTION_HEIGHT);

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

	function scroll_to_position(position: number): void {
		list_scroll_y = position;
		listElement?.scrollTo?.(0, position);
	}

	function scroll_to_option(index: number): void {
		const option_position = filtered_indices.indexOf(index);
		if (option_position === -1) {
			return;
		}
		scroll_to_position(option_position * OPTION_HEIGHT);
	}

	function scroll_active_option_into_view(): void {
		if (!use_virtual || active_index === null || !listElement) {
			return;
		}
		const option_position = filtered_indices.indexOf(active_index);
		if (option_position === -1) {
			return;
		}
		const option_top = option_position * OPTION_HEIGHT;
		const option_bottom = option_top + OPTION_HEIGHT;
		const viewport_height = listElement.clientHeight || max_height;
		if (option_top < list_scroll_y) {
			scroll_to_position(option_top);
		} else if (option_bottom > list_scroll_y + viewport_height) {
			scroll_to_position(option_bottom - viewport_height);
		}
	}

	$effect(() => {
		if (show_options && refElement) {
			if (remember_scroll) {
				restore_last_scroll();
			} else {
				if (listElement && selected_indices.length > 0) {
					if (use_virtual && typeof selected_indices[0] === "number") {
						scroll_to_option(selected_indices[0]);
					} else {
						let elements = listElement.querySelectorAll("li");
						for (const element of Array.from(elements)) {
							if (
								element.getAttribute("data-index") ===
								selected_indices[0].toString()
							) {
								listElement?.scrollTo?.(
									0,
									(element as HTMLLIElement).offsetTop
								);
								break;
							}
						}
					}
				}
			}
			calculate_window_distance();
			const rect = refElement.parentElement?.getBoundingClientRect();
			input_height = rect?.height || 0;
			input_width = rect?.width || 0;
			onload?.();
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
	});

	$effect(() => {
		if (!use_virtual || !listElement) {
			return;
		}
		const max_scroll = Math.max(0, virtual_total_height - max_height);
		if (list_scroll_y > max_scroll) {
			scroll_to_position(max_scroll);
		}
	});

	$effect(() => {
		scroll_active_option_into_view();
	});
</script>

<svelte:window on:scroll={scroll_listener} bind:innerHeight />

<div class="reference" bind:this={refElement} />
{#if show_options && !disabled}
	<ul
		class="options"
		class:virtual={use_virtual}
		transition:fly={{ duration: 200, y: 5 }}
		onmousedown={(e) => {
			e.preventDefault();
			onchange?.((e.target as HTMLElement).dataset.index);
		}}
		onscroll={(e) => (list_scroll_y = e.currentTarget.scrollTop)}
		style:top
		style:bottom
		style:max-height={`calc(${max_height}px - var(--window-padding))`}
		style:width={input_width + "px"}
		bind:this={listElement}
		role="listbox"
	>
		{#if use_virtual}
			<li
				class="virtual-spacer"
				style:height={virtual_total_height + "px"}
				aria-hidden="true"
				role="presentation"
			></li>
		{/if}
		{#each visible_indices as index, offset}
			<li
				class="item"
				class:virtual-item={use_virtual}
				class:selected={selected_indices.includes(index)}
				class:active={index === active_index}
				class:bg-gray-100={index === active_index}
				class:dark:bg-gray-600={index === active_index}
				style:width={input_width + "px"}
				style:transform={use_virtual
					? `translateY(${virtual_offset + offset * OPTION_HEIGHT}px)`
					: undefined}
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
		--window-padding: var(--size-8, 32px);
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
		box-sizing: border-box;
		min-height: 32px;
		padding: var(--size-2);
		word-break: break-word;
	}

	.virtual {
		position: fixed;
	}

	.virtual-item {
		position: absolute;
		top: 0;
		left: 0;
	}

	.virtual-spacer {
		pointer-events: none;
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
