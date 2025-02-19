<script lang="ts">
	import { onMount } from "svelte";
	import CellMenuIcons from "./CellMenuIcons.svelte";
	import type { I18nFormatter } from "js/utils/src";

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

	export let i18n: I18nFormatter;
	let menu_element: HTMLDivElement;

	$: is_header = row === -1;
	$: can_add_rows = row_count[1] === "dynamic";
	$: can_add_columns = col_count[1] === "dynamic";

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
</script>

<div bind:this={menu_element} class="cell-menu">
	{#if !is_header && can_add_rows}
		<button on:click={() => on_add_row_above()}>
			<CellMenuIcons icon="add-row-above" />
			{i18n("dataframe.add_row_above")}
		</button>
		<button on:click={() => on_add_row_below()}>
			<CellMenuIcons icon="add-row-below" />
			{i18n("dataframe.add_row_below")}
		</button>
		{#if can_delete_rows}
			<button on:click={on_delete_row} class="delete">
				<CellMenuIcons icon="delete-row" />
				{i18n("dataframe.delete_row")}
			</button>
		{/if}
	{/if}
	{#if can_add_columns}
		<button on:click={() => on_add_column_left()}>
			<CellMenuIcons icon="add-column-left" />
			{i18n("dataframe.add_column_left")}
		</button>
		<button on:click={() => on_add_column_right()}>
			<CellMenuIcons icon="add-column-right" />
			{i18n("dataframe.add_column_right")}
		</button>
		{#if can_delete_cols}
			<button on:click={on_delete_col} class="delete">
				<CellMenuIcons icon="delete-column" />
				{i18n("dataframe.delete_column")}
			</button>
		{/if}
	{/if}
</div>

<style>
	.cell-menu {
		position: fixed;
		z-index: var(--layer-4);
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		box-shadow: var(--shadow-drop-lg);
		min-width: 150px;
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
	}

	.cell-menu button:hover {
		background-color: var(--background-fill-secondary);
	}

	.cell-menu button :global(svg) {
		fill: currentColor;
		transition: fill 0.2s;
	}
</style>
