<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	export let value: string | string[] | undefined = undefined;
	export let filtered: string[];
	export let showOptions = false;
	export let activeOption: string | null;
	export let disabled = false;

	let distance_from_top: number;
	let distance_from_bottom: number;
	let input_height: number;
	let input_width: number;
	let refElement: HTMLDivElement;
	let listElement: HTMLUListElement;
	let top: string | null, bottom: string | null, max_height: number;
	let innerHeight: number;

	function calculate_window_distance(): void {
		const { top: ref_top, bottom: ref_bottom } =
			refElement.getBoundingClientRect();
		distance_from_top = ref_top;
		distance_from_bottom = innerHeight - ref_bottom;
	}

	let scroll_timeout: NodeJS.Timeout | null = null;
	function scroll_listener(): void {
		if (!showOptions) return;
		if (scroll_timeout !== null) {
			clearTimeout(scroll_timeout);
		}

		scroll_timeout = setTimeout(() => {
			calculate_window_distance();
			scroll_timeout = null;
		}, 10);
	}

	$: {
		if (showOptions && refElement) {
			if (listElement && typeof value === "string") {
				let el = document.querySelector(
					`li[data-value="${value}"]`
				) as HTMLLIElement;
				if (el) {
					listElement.scrollTo(0, el.offsetTop);
				}
			}
			calculate_window_distance();
			const rect = refElement.parentElement?.getBoundingClientRect();
			input_height = rect?.height || 0;
			input_width = rect?.width || 0;
		}
		if (distance_from_bottom > distance_from_top) {
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
	$: _value = Array.isArray(value) ? value : [value];
</script>

<svelte:window on:scroll={scroll_listener} bind:innerHeight />

<div class="reference" bind:this={refElement} />
{#if showOptions && !disabled}
	<!-- TODO: fix-->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<ul
		class="options"
		transition:fly={{ duration: 200, y: 5 }}
		on:mousedown|preventDefault={(e) => dispatch("change", e)}
		style:top
		style:bottom
		style:max-height={`calc(${max_height}px - var(--window-padding))`}
		style:width={input_width + "px"}
		bind:this={listElement}
	>
		{#each filtered as choice}
			<!-- TODO: fix-->
			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<li
				class="item"
				role="button"
				class:selected={_value.includes(choice)}
				class:active={activeOption === choice}
				class:bg-gray-100={activeOption === choice}
				class:dark:bg-gray-600={activeOption === choice}
				data-value={choice}
				aria-label={choice}
			>
				<span class:hide={!_value.includes(choice)} class="inner-item">
					✓
				</span>
				{choice}
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
