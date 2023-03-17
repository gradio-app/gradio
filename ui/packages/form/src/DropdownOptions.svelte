<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	export let value: string | Array<string> | undefined = undefined;
	export let filtered: Array<string>;
	export let showOptions: boolean = false;
	export let activeOption: string;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher();
</script>

{#if showOptions && !disabled}
	<ul
		class="options"
		aria-expanded={showOptions}
		transition:fly={{ duration: 200, y: 5 }}
		on:mousedown|preventDefault={(e) => dispatch("change", e)}
	>
		{#each filtered as choice}
			<li
				class="item"
				role="button"
				class:selected={value?.includes(choice)}
				class:active={activeOption === choice}
				class:bg-gray-100={activeOption === choice}
				class:dark:bg-gray-600={activeOption === choice}
				data-value={choice}
				aria-label={choice}
			>
				<span
					class:hide={!(Array.isArray(value) ? value : [value])?.includes(
						choice
					)}
					class="inner-item pr-1"
				>
					✓
				</span>
				{choice}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.options {
		position: absolute;
		z-index: var(--layer-5);
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--container-radius);
		background: var(--background-primary);
		width: var(--size-full);
		max-height: var(--size-32);
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
		background: var(--background-secondary);
	}

	.inner-item {
		padding-right: var(--size-1);
	}

	.hide {
		visibility: hidden;
	}
</style>
