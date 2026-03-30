<script lang="ts">
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { SortDirection } from "./types";

	let {
		value,
		col_idx,
		is_editing = false,
		is_selected = false,
		is_static = false,
		sort_direction = null,
		sort_priority = null,
		multi_sort = false,
		is_filtered = false,
		show_menu_button = false,
		is_first_column = false,
		latex_delimiters,
		line_breaks = true,
		editable = true,
		max_chars = undefined,
		i18n,
		onclick,
		on_menu_click,
		on_end_edit
	}: {
		value: string;
		col_idx: number;
		is_editing?: boolean;
		is_selected?: boolean;
		is_static?: boolean;
		sort_direction?: SortDirection | null;
		sort_priority?: number | null;
		multi_sort?: boolean;
		is_filtered?: boolean;
		show_menu_button?: boolean;
		is_first_column?: boolean;
		latex_delimiters: { left: string; right: string; display: boolean }[];
		line_breaks?: boolean;
		editable?: boolean;
		max_chars?: number | undefined;
		i18n: I18nFormatter;
		onclick: (event: MouseEvent, col: number) => void;
		on_menu_click: (event: MouseEvent, col: number) => void;
		on_end_edit: (key: string) => void;
	} = $props();
</script>

<th
	class="header-cell"
	class:focus={is_editing || is_selected}
	class:sorted={sort_direction !== null}
	class:filtered={is_filtered}
	class:first-column={is_first_column}
	onclick={(e) => onclick(e, col_idx)}
	onmousedown={(e) => {
		e.preventDefault();
		e.stopPropagation();
	}}
	title={value}
>
	<div class="cell-wrap">
		<div class="header-content">
			<EditableCell
				{value}
				{latex_delimiters}
				{line_breaks}
				edit={is_editing}
				onkeydown={(event) => {
					if (["Enter", "Escape", "Tab"].includes(event.key)) {
						on_end_edit(event.key);
					}
				}}
				header
				{editable}
				{is_static}
				{i18n}
				{max_chars}
				coords={[col_idx, 0]}
			/>
			{#if sort_direction}
				<span class="sort-indicator">
					{sort_direction === "asc" ? "▲" : "▼"}
					{#if multi_sort}
						<span class="sort-priority">{sort_priority}</span>
					{/if}
				</span>
			{/if}
			{#if is_static}
				<span class="static-icon">🔒</span>
			{/if}
		</div>
		{#if show_menu_button}
			<CellMenuButton on_click={(e) => on_menu_click(e, col_idx)} />
		{/if}
	</div>
</th>

<style>
	.header-cell {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow:
			inset 1px 0 0 var(--border-color-primary),
			inset 0 0 0 1px var(--ring-color);
		padding: 0;
		background: var(--table-even-background-fill) !important;
		font-weight: var(--weight-bold, 700);
	}

	.header-cell.first-column {
		box-shadow: inset 0 0 0 1px var(--ring-color);
	}

	.header-cell:hover :global(.cell-menu-button),
	.header-cell.focus :global(.cell-menu-button) {
		display: flex;
	}

	.header-cell.focus {
		--ring-color: var(--color-accent);
		box-shadow:
			inset 1px 0 0 var(--border-color-primary),
			inset 0 0 0 2px var(--ring-color);
		z-index: 4;
	}

	.header-cell.focus.first-column {
		box-shadow: inset 0 0 0 2px var(--ring-color);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		overflow: hidden;

		min-width: 0;
	}

	.sort-indicator {
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 10px;
		opacity: 0.7;
		flex-shrink: 0;
	}

	.sort-priority {
		font-size: 9px;
		background: var(--button-secondary-background-fill);
		border-radius: var(--radius-sm);
		width: 14px;
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.static-icon {
		font-size: 12px;
		flex-shrink: 0;
	}

	.cell-wrap {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		outline: none;
		min-height: var(--size-9);
		position: relative;
		height: 100%;
		padding: var(--size-2);
		box-sizing: border-box;
		gap: var(--size-1);
		overflow: visible;
		min-width: 0;
	}
</style>
