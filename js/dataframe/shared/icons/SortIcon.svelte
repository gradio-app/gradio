<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import SortButtonUp from "./SortButtonUp.svelte";
	import SortButtonDown from "./SortButtonDown.svelte";
	import { IconButton } from "@gradio/atoms";
	type SortDirection = "asc" | "desc";
	export let direction: SortDirection | null = null;
	export let priority: number | null = null;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{ sort: SortDirection }>();
</script>

<div class="sort-icons" role="group" aria-label={i18n("dataframe.sort_column")}>
	{#if (direction === "asc" || direction === "desc") && priority !== null}
		<span aria-label={`Sort priority: ${priority}`} class="priority"
			>{priority}</span
		>
	{/if}
	<IconButton
		size="x-small"
		label={i18n("dataframe.sort_ascending")}
		Icon={SortButtonUp}
		highlight={direction === "asc"}
		on:click={(event) => {
			event.stopPropagation();
			dispatch("sort", "asc");
		}}
	></IconButton>
	<IconButton
		size="x-small"
		label={i18n("dataframe.sort_descending")}
		Icon={SortButtonDown}
		highlight={direction === "desc"}
		on:click={(event) => {
			event.stopPropagation();
			dispatch("sort", "desc");
		}}
	></IconButton>
</div>

<style>
	.sort-icons {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-right: var(--spacing-sm);
	}

	.sort-icons :global(button) {
		margin-bottom: var(--spacing-xs);
		border: 1px solid var(--border-color-primary);
		background: unset;
	}

	.priority {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		font-size: var(--size-2);
		left: 19px;
		z-index: var(--layer-3);
		top: var(--spacing-xs);
		background-color: var(--button-secondary-background-fill);
		color: var(--body-text-color);
		border-radius: var(--radius-sm);
		width: var(--size-2-5);
		height: var(--size-2-5);
	}
</style>
