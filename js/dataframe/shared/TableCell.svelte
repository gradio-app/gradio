<script lang="ts">
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { Datatype } from "./utils";
	import { is_cell_in_selection } from "./selection_utils";

	export let value: string | number;
	export let index: number;
	export let j: number;
	export let actual_pinned_columns: number;
	export let get_cell_width: (index: number) => string;
	export let handle_cell_click: (
		event: MouseEvent,
		row: number,
		col: number
	) => void;
	export let handle_blur: (
		event: CustomEvent<{
			blur_event: FocusEvent;
			coords: [number, number];
		}>
	) => void;
	export let toggle_cell_menu: (
		event: MouseEvent,
		row: number,
		col: number
	) => void;
	export let is_cell_selected: (
		coords: [number, number],
		selected_cells: [number, number][]
	) => string;
	export let should_show_cell_menu: (
		coords: [number, number],
		selected_cells: [number, number][],
		editable: boolean
	) => boolean;
	export let selected_cells: [number, number][];
	export let copy_flash: boolean;
	export let active_cell_menu: {
		row: number;
		col: number;
		x: number;
		y: number;
	} | null;
	export let styling: string | undefined;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let line_breaks: boolean;
	export let datatype: Datatype;
	export let editing: [number, number] | false;
	export let max_chars: number | undefined;
	export let root: string;
	export let editable: boolean;
	export let is_static = false;
	export let i18n: I18nFormatter;
	export let components: Record<string, any> = {};
	export let el: {
		cell: HTMLTableCellElement | null;
		input: HTMLInputElement | null;
	};
	export let handle_select_column: (col: number) => void;
	export let handle_select_row: (row: number) => void;
	export let is_dragging: boolean;
	export let display_value: string | undefined;
	export let wrap = false;

	function get_cell_position(col_index: number): string {
		if (col_index >= actual_pinned_columns) {
			return "auto";
		}

		if (col_index === 0) {
			return "0";
		}

		const previous_widths = Array(col_index)
			.fill(0)
			.map((_, idx) => {
				return get_cell_width(idx);
			})
			.join(" + ");

		return `calc(${previous_widths})`;
	}

	$: cell_classes = is_cell_selected([index, j], selected_cells || []);
	$: is_in_selection = is_cell_in_selection([index, j], selected_cells);
	$: has_no_top = cell_classes.includes("no-top");
	$: has_no_bottom = cell_classes.includes("no-bottom");
	$: has_no_left = cell_classes.includes("no-left");
	$: has_no_right = cell_classes.includes("no-right");
</script>

<td
	class:pinned-column={j < actual_pinned_columns}
	class:last-pinned={j === actual_pinned_columns - 1}
	tabindex={j < actual_pinned_columns ? -1 : 0}
	bind:this={el.cell}
	data-row={index}
	data-col={j}
	data-testid={`cell-${index}-${j}`}
	on:mousedown={(e) => handle_cell_click(e, index, j)}
	on:contextmenu|preventDefault={(e) => toggle_cell_menu(e, index, j)}
	style="width: {get_cell_width(j)}; left: {get_cell_position(j)}; {styling ||
		''}"
	class:flash={copy_flash && is_in_selection}
	class:cell-selected={is_in_selection}
	class:no-top={has_no_top}
	class:no-bottom={has_no_bottom}
	class:no-left={has_no_left}
	class:no-right={has_no_right}
	class:menu-active={active_cell_menu &&
		active_cell_menu.row === index &&
		active_cell_menu.col === j}
	class:dragging={is_dragging}
>
	<div class="cell-wrap">
		<EditableCell
			bind:value
			bind:el={el.input}
			display_value={display_value !== undefined
				? display_value
				: String(value)}
			{latex_delimiters}
			{line_breaks}
			{editable}
			{is_static}
			edit={editing && editing[0] === index && editing[1] === j}
			{datatype}
			on:focus={() => {
				const row = index;
				const col = j;
				if (!selected_cells.some(([r, c]) => r === row && c === col)) {
					selected_cells = [[row, col]];
				}
			}}
			on:blur={handle_blur}
			{root}
			{max_chars}
			{i18n}
			{components}
			show_selection_buttons={selected_cells.length === 1 &&
				selected_cells[0][0] === index &&
				selected_cells[0][1] === j}
			coords={[index, j]}
			on_select_column={handle_select_column}
			on_select_row={handle_select_row}
			{is_dragging}
			wrap_text={wrap}
		/>
		{#if editable && should_show_cell_menu([index, j], selected_cells, editable)}
			<CellMenuButton on_click={(event) => toggle_cell_menu(event, index, j)} />
		{/if}
	</div>
</td>

<style>
	td {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow: inset 0 0 0 1px var(--ring-color);
		padding: 0;
		border-right-width: 0px;
		border-left-width: 1px;
		border-style: solid;
		border-color: var(--border-color-primary);
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
		margin: 0;
		gap: var(--size-1);
		overflow: visible;
		min-width: 0;
		border-radius: var(--table-radius);
	}

	.cell-selected {
		--ring-color: var(--color-accent);
		box-shadow: inset 0 0 0 2px var(--ring-color);
		z-index: 2;
		position: relative;
	}

	.cell-selected :global(.cell-menu-button) {
		display: flex;
	}

	.flash.cell-selected {
		animation: flash-color 700ms ease-out;
	}

	@keyframes flash-color {
		0%,
		30% {
			background: var(--color-accent-copied);
		}

		100% {
			background: transparent;
		}
	}

	.pinned-column {
		position: sticky;
		z-index: 3;
		border-right: none;
	}

	.pinned-column:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}

	.pinned-column:nth-child(even) {
		background: var(--table-even-background-fill);
	}

	td:first-child {
		border-left-width: 0px;
	}

	:global(tr:last-child) td:first-child {
		border-bottom-left-radius: var(--table-radius);
	}

	:global(tr:last-child) td:last-child {
		border-bottom-right-radius: var(--table-radius);
	}

	.dragging {
		cursor: crosshair;
	}

	/* Add back the cell selection border styles */
	.cell-selected.no-top {
		box-shadow:
			inset 2px 0 0 var(--ring-color),
			inset -2px 0 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-bottom {
		box-shadow:
			inset 2px 0 0 var(--ring-color),
			inset -2px 0 0 var(--ring-color),
			inset 0 2px 0 var(--ring-color);
	}

	.cell-selected.no-left {
		box-shadow:
			inset 0 2px 0 var(--ring-color),
			inset -2px 0 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-right {
		box-shadow:
			inset 0 2px 0 var(--ring-color),
			inset 2px 0 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-top.no-left {
		box-shadow:
			inset -2px 0 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-top.no-right {
		box-shadow:
			inset 2px 0 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-bottom.no-left {
		box-shadow:
			inset -2px 0 0 var(--ring-color),
			inset 0 2px 0 var(--ring-color);
	}

	.cell-selected.no-bottom.no-right {
		box-shadow:
			inset 2px 0 0 var(--ring-color),
			inset 0 2px 0 var(--ring-color);
	}

	.cell-selected.no-top.no-bottom {
		box-shadow:
			inset 2px 0 0 var(--ring-color),
			inset -2px 0 0 var(--ring-color);
	}

	.cell-selected.no-left.no-right {
		box-shadow:
			inset 0 2px 0 var(--ring-color),
			inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-top.no-left.no-right {
		box-shadow: inset 0 -2px 0 var(--ring-color);
	}

	.cell-selected.no-bottom.no-left.no-right {
		box-shadow: inset 0 2px 0 var(--ring-color);
	}

	.cell-selected.no-left.no-top.no-bottom {
		box-shadow: inset -2px 0 0 var(--ring-color);
	}

	.cell-selected.no-right.no-top.no-bottom {
		box-shadow: inset 2px 0 0 var(--ring-color);
	}

	.cell-selected.no-top.no-bottom.no-left.no-right {
		box-shadow: none;
	}
</style>
