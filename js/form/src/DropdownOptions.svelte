<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	export let value: string | Array<string> | undefined = undefined;
	export let filtered: Array<string>;
	export let showOptions: boolean = false;
	export let activeOption: string | null;
	export let disabled: boolean = false;

	let distance_from_top: number;
	let distance_from_bottom: number;
	let input_height: number;
	let refElement: HTMLDivElement;
	let listElement: HTMLUListElement;
	let top: string | null, bottom: string | null, max_height: number;
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
			distance_from_top = refElement.getBoundingClientRect().top;
			distance_from_bottom =
				window.innerHeight - refElement.getBoundingClientRect().bottom;
			input_height =
				refElement.parentElement?.getBoundingClientRect().height || 0;
		}
		if (distance_from_bottom > distance_from_top) {
			top = `${input_height}px`;
			max_height = distance_from_bottom;
			bottom = null;
		} else {
			bottom = `${input_height}px`;
			max_height = distance_from_top - input_height;
			top = null;
		}
	}

	const dispatch = createEventDispatcher();
	$: _value = Array.isArray(value) ? value : [value];
</script>

<div class="reference" bind:this={refElement} />
{#if showOptions && !disabled}
	<ul
		class="options"
		aria-expanded={showOptions}
		transition:fly={{ duration: 200, y: 5 }}
		on:mousedown|preventDefault={(e) => dispatch("change", e)}
		style:top
		style:bottom
		style:max-height={`calc(${max_height}px - var(--window-padding))`}
		bind:this={listElement}
	>
		{#each filtered as choice}
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
		position: absolute;
		z-index: var(--layer-5);
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--container-radius);
		background: var(--background-fill-primary);
		width: var(--size-full);
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
