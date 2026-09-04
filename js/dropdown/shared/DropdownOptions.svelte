<script lang="ts">
	import { fly } from "svelte/transition";
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
		listbox_id = undefined,
		num_choices_shown = null,
		remaining_choices = 0,
		onchange,
		onload_more,
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
		listbox_id?: string;
		num_choices_shown?: number | null;
		remaining_choices?: number;
		onchange?: (index: any) => void;
		onload_more?: () => void;
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
	let choices_viewport_height: string | null = $state(null);
	let innerHeight = $state(0);
	let list_scroll_y = 0;
	let loading_more = false;
	let previous_filtered_count = filtered_indices.length;

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

	function handle_list_scroll(e: Event): void {
		const element = e.currentTarget as HTMLUListElement;
		list_scroll_y = element.scrollTop;
		if (
			remaining_choices > 0 &&
			!loading_more &&
			element.scrollHeight - element.scrollTop - element.clientHeight <= 2
		) {
			loading_more = true;
			onload_more?.();
		}
	}

	$effect(() => {
		if (filtered_indices.length !== previous_filtered_count) {
			loading_more = false;
			previous_filtered_count = filtered_indices.length;
		}
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
		if (
			show_options &&
			listElement &&
			num_choices_shown !== null &&
			filtered_indices.length > 0
		) {
			const items = Array.from(
				listElement.querySelectorAll<HTMLLIElement>("li.item")
			).slice(0, num_choices_shown);
			const height = items.reduce(
				(total, item) => total + item.getBoundingClientRect().height,
				0
			);
			choices_viewport_height =
				filtered_indices.length + remaining_choices > num_choices_shown
					? `${height}px`
					: null;
		} else {
			choices_viewport_height = null;
		}
	});
</script>

<svelte:window onscroll={scroll_listener} bind:innerHeight />

<div class="reference" bind:this={refElement} />
{#if show_options && !disabled}
	<div
		class="options"
		transition:fly={{ duration: 200, y: 5 }}
		style:top
		style:bottom
		style:max-height={`calc(${max_height}px - var(--window-padding))`}
		style:width={input_width + "px"}
	>
		<ul
			class="option-list"
			onmousedown={(e) => {
				e.preventDefault();
				onchange?.((e.target as HTMLElement).dataset.index);
			}}
			onscroll={handle_list_scroll}
			style:height={choices_viewport_height}
			bind:this={listElement}
			id={listbox_id}
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
					id={listbox_id ? `${listbox_id}-option-${index}` : undefined}
					aria-label={choices[index][0]}
					data-testid="dropdown-option"
					role="option"
					aria-selected={selected_indices.includes(index)}
				>
					<span
						class:hide={!selected_indices.includes(index)}
						class="inner-item"
					>
						✓
					</span>
					{choices[index][0]}
				</li>
			{/each}
			{#if remaining_choices > 0}
				<li class="scroll-sentinel" role="presentation" aria-hidden="true"></li>
			{/if}
		</ul>
		<span class="sr-only" aria-live="polite">
			{filtered_indices.length} choices shown, {remaining_choices} remaining
		</span>
	</div>
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
		display: flex;
		flex-direction: column;
		overflow: hidden;
		color: var(--body-text-color);
	}

	.option-list {
		min-height: 0;
		margin: 0;
		padding: 0;
		overflow: auto;
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

	.scroll-sentinel {
		display: block;
		height: 1px;
		min-height: 1px;
		pointer-events: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.hide {
		visibility: hidden;
	}
</style>
