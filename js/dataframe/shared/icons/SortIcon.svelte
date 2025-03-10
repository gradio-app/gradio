<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";

	type SortDirection = "asc" | "desc";
	export let direction: SortDirection | null = null;
	export let priority: number | null = null;
	export let i18n: I18nFormatter;
	export let sorted_columns_length: number;

	const dispatch = createEventDispatcher<{ sort: SortDirection }>();
</script>

<div class="sort-icons" role="group" aria-label={i18n("dataframe.sort_column")}>
	{#if sorted_columns_length > 1}
		{#if direction === "asc" && priority !== null}
			<span aria-label={`Sort priority: ${priority}`} class="priority"
				>{priority}</span
			>
		{/if}
		{#if direction === "desc" && priority !== null}
			<span aria-label={`Sort priority: ${priority}`} class="priority"
				>{priority}</span
			>
		{/if}
	{/if}
	<button
		class="sort-button up"
		class:active={direction === "asc"}
		on:click={(event) => {
			event.stopPropagation();
			dispatch("sort", "asc");
		}}
		aria-label={i18n("dataframe.sort_ascending")}
		aria-pressed={direction === "asc"}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M7 14l5-5 5 5"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
	<button
		class="sort-button down"
		class:active={direction === "desc"}
		on:click={(event) => {
			event.stopPropagation();
			dispatch("sort", "desc");
		}}
		aria-label={i18n("dataframe.sort_descending")}
		aria-pressed={direction === "desc"}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M7 10l5 5 5-5"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
</div>

<style>
	.sort-icons {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-right: var(--spacing-sm);
	}

	.sort-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 150ms;
		position: relative;
	}

	.sort-button:hover {
		opacity: 0.8;
	}

	.sort-button.active {
		opacity: 1;
		color: var(--color-accent);
	}

	svg {
		width: var(--size-3);
		height: var(--size-3);
		display: block;
	}

	.priority {
		position: absolute;
		font-size: 9px;
		left: 15px;
		top: 2px;
		background-color: var(--block-background-fill);
		color: white;
		border-radius: var(--radius-sm);
		width: 12px;
		height: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
</style>
