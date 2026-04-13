<script lang="ts">
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import Padlock from "./icons/Padlock.svelte";
	import FilterIcon from "./icons/FilterIcon.svelte";
	import SortButtonUp from "./icons/SortButtonUp.svelte";
	import SortButtonDown from "./icons/SortButtonDown.svelte";
	import { BaseCheckbox } from "@gradio/checkbox";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { SortDirection } from "./types";

	let {
		value,
		col_idx,
		is_editing = false,
		is_selected = false,
		is_static = false,
		is_bool = false,
		select_all_state = "unchecked",
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
		on_end_edit,
		on_select_all
	}: {
		value: string;
		col_idx: number;
		is_editing?: boolean;
		is_selected?: boolean;
		is_static?: boolean;
		is_bool?: boolean;
		select_all_state?: "checked" | "unchecked" | "indeterminate";
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
		on_select_all?: (col: number, checked: boolean) => void;
	} = $props();

	let show_select_all = $derived(
		is_bool && editable && !is_static && !!on_select_all
	);
</script>

<th
	class="header-cell"
	class:focus={is_editing || is_selected}
	class:sorted={sort_direction !== null}
	class:filtered={is_filtered}
	class:first-column={is_first_column}
	data-heading={col_idx}
	onclick={(e) => onclick(e, col_idx)}
	onmousedown={(e) => {
		e.preventDefault();
		e.stopPropagation();
	}}
	title={value}
>
	<div class="cell-wrap">
		<div class="header-content">
			{#if show_select_all}
				<div
					class="select-all-checkbox"
					role="button"
					tabindex="-1"
					onclick={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
				>
					<BaseCheckbox
						value={select_all_state === "checked"}
						indeterminate={select_all_state === "indeterminate"}
						label={`Toggle all: ${value}`}
						interactive={true}
						on_select={() =>
							on_select_all?.(col_idx, select_all_state !== "checked")}
					/>
				</div>
			{/if}
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
				pad_left={show_select_all ? true : false}
			/>
		</div>
		{#if sort_direction || is_filtered || is_static}
			<span class="header-icons">
				{#if is_filtered}
					<span class="filter-indicator" aria-label="Filtered">
						<FilterIcon />
					</span>
				{/if}
				{#if sort_direction}
					<span
						class="sort-indicator"
						aria-label="Sorted {sort_direction}ending"
					>
						{#if sort_direction === "asc"}
							<SortButtonUp size={13} />
						{:else}
							<SortButtonDown size={13} />
						{/if}
						{#if multi_sort && sort_priority != null}
							<span class="sort-priority">{sort_priority}</span>
						{/if}
					</span>
				{/if}

				{#if is_static}
					<Padlock size={11} />
				{/if}
			</span>
		{/if}
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
		outline: none;
		box-shadow:
			inset 1px 0 0 var(--border-color-primary),
			inset 0 0 0 1px var(--ring-color);
		padding: 0;
		overflow: visible;
		box-sizing: border-box;
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
		--sel-top: inset 0 2px 0 0 var(--ring-color);
		--sel-bottom: inset 0 -2px 0 0 var(--ring-color);
		--sel-left: inset 2px 0 0 0 var(--ring-color);
		--sel-right: inset -2px 0 0 0 var(--ring-color);
		box-shadow:
			var(--sel-top), var(--sel-bottom), var(--sel-left), var(--sel-right);
		z-index: 2;
		position: relative;
	}

	.header-cell.focus.first-column {
		box-shadow: inset 0 0 0 2px var(--ring-color);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		overflow: hidden;
		min-width: 0;
	}

	.header-icons {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
		margin-left: auto;
		opacity: 0.6;
	}

	.sort-indicator {
		display: flex;
		align-items: center;
		position: relative;
		margin-left: -5px;
	}

	.sort-priority {
		font-size: 8px;
		background: var(--button-secondary-background-fill);
		border-radius: var(--radius-full);
		width: 12px;
		height: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.filter-indicator {
		display: flex;
		align-items: center;
		width: 16px;
		height: 16px;
		margin-top: 3px;
	}

	.filter-indicator :global(svg) {
		width: 100%;
		height: 100%;
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

	.select-all-checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--size-4);
	}

	.select-all-checkbox :global(label) {
		margin: 0;
	}

	.select-all-checkbox :global(span) {
		display: none;
	}
</style>
