<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	export let value: string | Array<string> | undefined = undefined;
	export let filtered: Array<string>;
	export let showOptions: boolean = false;
	export let activeOption: string;
	export let disabled: boolean = false;

	let distance_from_top: number;
	let distance_from_bottom: number;
	let input_height: number;
	let refElement: HTMLDivElement;
	let top: string | null, bottom: string | null, max_height: number;
	$: {
		if (showOptions && refElement) {
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

	function isSelected(choice: string) {
		let arr = Array.isArray(value) ? value : [value];
		return arr.includes(choice);
	}
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
	>
		{#each filtered as choice}
			<li
				class="item"
				role="button"
				class:selected={isSelected(choice)}
				class:active={activeOption === choice}
				class:bg-gray-100={activeOption === choice}
				class:dark:bg-gray-600={activeOption === choice}
				data-value={choice}
				aria-label={choice}
			>
				<span class:hide={!isSelected(choice)} class="inner-item pr-1">
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
		overflow: auto;
		color: var(--body-text-color);
		list-style: none;
        min-width: fit-content;
        max-width: inherit;
        white-space: nowrap;
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
