<script lang="ts">
	import { onMount } from "svelte";
	import CellMenuIcons from "./CellMenuIcons.svelte";
	import FilterMenu from "./FilterMenu.svelte";
	import type { I18nFormatter } from "js/utils/src";
	import type {
		SortDirection,
		FilterDatatype
	} from "./context/dataframe_context";

	export let x: number;
	export let y: number;
	export let on_add_row_above: () => void;
	export let on_add_row_below: () => void;
	export let on_add_column_left: () => void;
	export let on_add_column_right: () => void;
	export let row: number;
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let on_delete_row: () => void;
	export let on_delete_col: () => void;
	export let can_delete_rows: boolean;
	export let can_delete_cols: boolean;
	export let on_sort: (direction: SortDirection) => void = () => {};
	export let on_clear_sort: () => void = () => {};
	export let sort_direction: SortDirection | null = null;
	export let sort_priority: number | null = null;
	export let on_filter: (
		datatype: FilterDatatype,
		selected_filter: string,
		value: string
	) => void = () => {};
	export let on_clear_filter: () => void = () => {};
	export let filter_active: boolean | null = null;
	export let editable = true;

	export let i18n: I18nFormatter;
	let menu_element: HTMLDivElement;
	let active_filter_menu: { x: number; y: number } | null = null;

	$: is_header = row === -1;
	$: can_add_rows = editable && row_count[1] === "dynamic";
	$: can_add_columns = editable && col_count[1] === "dynamic";

	onMount(() => {
		position_menu();
	});

	function position_menu(): void {
		if (!menu_element) return;

		const viewport_width = window.innerWidth;
		const viewport_height = window.innerHeight;
		const menu_rect = menu_element.getBoundingClientRect();

		let new_x = x - 30;
		let new_y = y - 20;

		if (new_x + menu_rect.width > viewport_width) {
			new_x = x - menu_rect.width + 10;
		}

		if (new_y + menu_rect.height > viewport_height) {
			new_y = y - menu_rect.height + 10;
		}

		menu_element.style.left = `${new_x}px`;
		menu_element.style.top = `${new_y}px`;
	}

	function toggle_filter_menu(): void {
		if (filter_active) {
			on_filter("string", "", "");
			return;
		}

		const menu_rect = menu_element.getBoundingClientRect();
		active_filter_menu = {
			x: menu_rect.right,
			y: menu_rect.top + menu_rect.height / 2
		};
	}
</script>

<div bind:this={menu_element} class="cell-menu" role="menu">
	{#if is_header}
		<button
			role="menuitem"
			on:click={() => on_sort("asc")}
			class:active={sort_direction === "asc"}
		>
			<CellMenuIcons icon="sort-asc" />
			{i18n("dataframe.sort_ascending")}
			{#if sort_direction === "asc" && sort_priority !== null}
				<span class="priority">{sort_priority}</span>
			{/if}
		</button>
		<button
			role="menuitem"
			on:click={() => on_sort("desc")}
			class:active={sort_direction === "desc"}
		>
			<CellMenuIcons icon="sort-desc" />
			{i18n("dataframe.sort_descending")}
			{#if sort_direction === "desc" && sort_priority !== null}
				<span class="priority">{sort_priority}</span>
			{/if}
		</button>
		<button role="menuitem" on:click={on_clear_sort}>
			<CellMenuIcons icon="clear-sort" />
			{i18n("dataframe.clear_sort")}
		</button>
		<button
			role="menuitem"
			on:click|stopPropagation={toggle_filter_menu}
			class:active={filter_active || active_filter_menu}
		>
			<CellMenuIcons icon="filter" />
			{i18n("dataframe.filter")}
			{#if filter_active}
				<span class="priority">1</span>
			{/if}
		</button>
		<button role="menuitem" on:click={on_clear_filter}>
			<CellMenuIcons icon="clear-filter" />
			{i18n("dataframe.clear_filter")}
		</button>
	{/if}

	{#if !is_header && can_add_rows}
		<button
			role="menuitem"
			on:click={() => on_add_row_above()}
			aria-label="Add row above"
		>
			<CellMenuIcons icon="add-row-above" />
			{i18n("dataframe.add_row_above")}
		</button>
		<button
			role="menuitem"
			on:click={() => on_add_row_below()}
			aria-label="Add row below"
		>
			<CellMenuIcons icon="add-row-below" />
			{i18n("dataframe.add_row_below")}
		</button>
		{#if can_delete_rows}
			<button
				role="menuitem"
				on:click={on_delete_row}
				class="delete"
				aria-label="Delete row"
			>
				<CellMenuIcons icon="delete-row" />
				{i18n("dataframe.delete_row")}
			</button>
		{/if}
	{/if}
	{#if can_add_columns}
		<button
			role="menuitem"
			on:click={() => on_add_column_left()}
			aria-label="Add column to the left"
		>
			<CellMenuIcons icon="add-column-left" />
			{i18n("dataframe.add_column_left")}
		</button>
		<button
			role="menuitem"
			on:click={() => on_add_column_right()}
			aria-label="Add column to the right"
		>
			<CellMenuIcons icon="add-column-right" />
			{i18n("dataframe.add_column_right")}
		</button>
		{#if can_delete_cols}
			<button
				role="menuitem"
				on:click={on_delete_col}
				class="delete"
				aria-label="Delete column"
			>
				<CellMenuIcons icon="delete-column" />
				{i18n("dataframe.delete_column")}
			</button>
		{/if}
	{/if}
</div>

{#if active_filter_menu}
	<FilterMenu {on_filter} />
{/if}

<style>
	.cell-menu {
		position: fixed;
		z-index: 9;
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		box-shadow: var(--shadow-drop-lg);
		min-width: 150px;
		z-index: var(--layer-1);
	}

	.cell-menu button {
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		font-size: var(--text-sm);
		transition:
			background-color 0.2s,
			color 0.2s;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		position: relative;
	}

	.cell-menu button.active {
		background-color: var(--background-fill-secondary);
	}

	.cell-menu button:hover {
		background-color: var(--background-fill-secondary);
	}

	.cell-menu button :global(svg) {
		fill: currentColor;
		transition: fill 0.2s;
	}

	.priority {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
		font-size: var(--size-2);
		background-color: var(--button-secondary-background-fill);
		color: var(--body-text-color);
		border-radius: var(--radius-sm);
		width: var(--size-2-5);
		height: var(--size-2-5);
	}
</style>
