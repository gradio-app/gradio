<script lang="ts">
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { CellValue } from "./types";
	import type { Datatype } from "./utils/utils";

	let {
		value,
		display_value = null,
		datatype = "str",
		row_idx,
		col_idx,
		col_style = "",
		cell_style = "",
		selection_classes = "",
		is_editing = false,
		is_flash = false,
		is_static = false,
		show_menu_button = false,
		show_selection_buttons = false,
		is_first_column = false,
		latex_delimiters,
		line_breaks = true,
		editable = true,
		max_chars = undefined,
		i18n,
		components = {},
		is_dragging = false,
		wrap_text = false,
		onmousedown,
		ondblclick,
		oncontextmenu,
		onblur,
		on_menu_click,
		on_select_column,
		on_select_row
	}: {
		value: CellValue;
		display_value?: string | null;
		datatype?: Datatype;
		row_idx: number;
		col_idx: number;
		col_style?: string;
		cell_style?: string;
		selection_classes?: string;
		is_editing?: boolean;
		is_flash?: boolean;
		is_static?: boolean;
		show_menu_button?: boolean;
		show_selection_buttons?: boolean;
		is_first_column?: boolean;
		latex_delimiters: { left: string; right: string; display: boolean }[];
		line_breaks?: boolean;
		editable?: boolean;
		max_chars?: number | undefined;
		i18n: I18nFormatter;
		components?: Record<string, any>;
		is_dragging?: boolean;
		wrap_text?: boolean;
		onmousedown: (event: MouseEvent) => void;
		ondblclick: (event: MouseEvent) => void;
		oncontextmenu: (event: MouseEvent) => void;
		onblur: (detail: {
			blur_event: FocusEvent;
			coords: [number, number];
		}) => void;
		on_menu_click: (event: MouseEvent) => void;
		on_select_column: (col: number) => void;
		on_select_row: (row: number) => void;
	} = $props();

	let is_selected = $derived(selection_classes !== "");
</script>

<div
	class="body-cell {selection_classes}"
	class:flash={is_flash}
	class:first-column={is_first_column}
	class:static={is_static}
	data-row={row_idx}
	data-col={col_idx}
	data-testid={`cell-${row_idx}-${col_idx}`}
	tabindex={is_static ? -1 : undefined}
	{onmousedown}
	{ondblclick}
	{oncontextmenu}
	style="{col_style} {cell_style}"
>
	<div class="cell-wrap">
		<EditableCell
			{value}
			{display_value}
			{latex_delimiters}
			{line_breaks}
			{editable}
			{is_static}
			edit={is_editing}
			{datatype}
			{onblur}
			{max_chars}
			{i18n}
			{components}
			{show_selection_buttons}
			coords={[row_idx, col_idx]}
			{on_select_column}
			{on_select_row}
			{is_dragging}
			{wrap_text}
		/>
		{#if show_menu_button}
			<CellMenuButton on_click={on_menu_click} />
		{/if}
	</div>
</div>

<style>
	.body-cell {
		--ring-color: transparent;
		outline: none;
		box-shadow:
			inset 1px 0 0 var(--border-color-primary),
			inset 0 0 0 1px var(--ring-color);
		padding: 0;
		overflow: visible;
		box-sizing: border-box;
		user-select: none;
	}

	.body-cell.static {
		user-select: text;
	}

	.body-cell.first-column {
		box-shadow: inset 0 0 0 1px var(--ring-color);
	}

	.body-cell:hover :global(.cell-menu-button),
	.body-cell.cell-selected :global(.cell-menu-button) {
		display: flex;
	}

	.body-cell.cell-selected {
		--ring-color: var(--color-accent);
		--sel-top: inset 0 2px 0 0 var(--ring-color);
		--sel-bottom: inset 0 -2px 0 0 var(--ring-color);
		--sel-left: inset 2px 0 0 0 var(--ring-color);
		--sel-right: inset -2px 0 0 0 var(--ring-color);
		box-shadow:
			var(--sel-top), var(--sel-bottom), var(--sel-left), var(--sel-right);
		z-index: 2;
		position: relative;
	}

	.body-cell.cell-selected.no-top {
		--sel-top: inset 0 0 0 0 transparent;
	}
	.body-cell.cell-selected.no-bottom {
		--sel-bottom: inset 0 0 0 0 transparent;
	}
	.body-cell.cell-selected.no-left {
		--sel-left: inset 0 0 0 0 transparent;
	}
	.body-cell.cell-selected.no-right {
		--sel-right: inset 0 0 0 0 transparent;
	}

	.body-cell.flash.cell-selected {
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

	.cell-wrap {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		outline: none;
		min-height: var(--size-9);
		position: relative;
		padding: var(--size-2);
		box-sizing: border-box;
		gap: var(--size-1);
		overflow: visible;
		min-width: 0;
		height: 100%;
	}
</style>
