<script lang="ts">
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { get_sort_status } from "./utils/sort_utils";
	import Padlock from "./icons/Padlock.svelte";
	import SortArrowUp from "./icons/SortArrowUp.svelte";
	import SortArrowDown from "./icons/SortArrowDown.svelte";
	import type { SortDirection } from "./context/dataframe_context";
	import CellMenuIcons from "./CellMenuIcons.svelte";
	import type { FilterDatatype } from "./context/dataframe_context";
	export let value: string;
	export let i: number;
	export let actual_pinned_columns: number;
	export let header_edit: number | false;
	export let selected_header: number | false;
	export let headers: string[];
	export let get_cell_width: (index: number) => string;
	export let handle_header_click: (event: MouseEvent, col: number) => void;
	export let toggle_header_menu: (event: MouseEvent, col: number) => void;
	export let end_header_edit: (event: CustomEvent<KeyboardEvent>) => void;
	export let sort_columns: { col: number; direction: SortDirection }[] = [];
	export let filter_columns: {
		col: number;
		datatype: FilterDatatype;
		filter: string;
		value: string;
	}[] = [];

	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let line_breaks: boolean;
	export let max_chars: number | undefined;
	export let editable: boolean;
	export let i18n: I18nFormatter;
	export let el: HTMLTextAreaElement | null;
	export let is_static: boolean;
	export let col_count: [number, "fixed" | "dynamic"];

	$: can_add_columns = col_count && col_count[1] === "dynamic";
	$: sort_index = sort_columns.findIndex((item) => item.col === i);
	$: filter_index = filter_columns.findIndex((item) => item.col === i);
	$: sort_priority = sort_index !== -1 ? sort_index + 1 : null;
	$: current_direction =
		sort_index !== -1 ? sort_columns[sort_index].direction : null;

	function get_header_position(col_index: number): string {
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
</script>

<th
	class:pinned-column={i < actual_pinned_columns}
	class:last-pinned={i === actual_pinned_columns - 1}
	class:focus={header_edit === i || selected_header === i}
	class:sorted={sort_index !== -1}
	class:filtered={filter_index !== -1}
	aria-sort={get_sort_status(value, sort_columns, headers) === "none"
		? "none"
		: get_sort_status(value, sort_columns, headers) === "asc"
			? "ascending"
			: "descending"}
	style="width: {get_cell_width(i)}; left: {get_header_position(i)};"
	on:click={(event) => handle_header_click(event, i)}
	on:mousedown={(event) => {
		event.preventDefault();
		event.stopPropagation();
	}}
	title={value}
>
	<div class="cell-wrap">
		<div class="header-content">
			<button
				class="header-button"
				on:click={(event) => handle_header_click(event, i)}
				on:mousedown={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
				title={value}
			>
				<EditableCell
					{max_chars}
					bind:value
					bind:el
					{latex_delimiters}
					{line_breaks}
					edit={header_edit === i}
					on:keydown={(event) => {
						if (
							event.detail.key === "Enter" ||
							event.detail.key === "Escape" ||
							event.detail.key === "Tab"
						) {
							end_header_edit(event);
						}
					}}
					header
					{editable}
					{is_static}
					{i18n}
					coords={[i, 0]}
				/>
				{#if sort_index !== -1}
					<div class="sort-indicators">
						<span class="sort-arrow">
							{#if current_direction === "asc"}
								<SortArrowUp size={12} />
							{:else}
								<SortArrowDown size={12} />
							{/if}
						</span>
						{#if sort_columns.length > 1}
							<span class="sort-priority">
								{sort_priority}
							</span>
						{/if}
					</div>
				{/if}
				{#if filter_index !== -1}
					<div class="filter-indicators">
						<span class="filter-icon">
							<CellMenuIcons icon="filter" />
						</span>
					</div>
				{/if}
			</button>
			{#if is_static}
				<Padlock />
			{/if}
		</div>
		{#if can_add_columns}
			<CellMenuButton on_click={(event) => toggle_header_menu(event, i)} />
		{/if}
	</div>
</th>

<style>
	th {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow: inset 0 0 0 1px var(--ring-color);
		padding: 0;
		background: var(--table-even-background-fill);
		border-right-width: 0px;
		border-left-width: 1px;
		border-style: solid;
		border-color: var(--border-color-primary);
	}

	th:first-child {
		border-top-left-radius: var(--table-radius);
		border-bottom-left-radius: var(--table-radius);
		border-left-width: 0px;
	}

	th:last-child {
		border-top-right-radius: var(--table-radius);
		border-bottom-right-radius: var(--table-radius);
	}

	th.focus {
		--ring-color: var(--color-accent);
		box-shadow: inset 0 0 0 2px var(--ring-color);
		z-index: 4;
	}

	th.focus :global(.cell-menu-button) {
		display: flex;
	}

	th:hover :global(.cell-menu-button) {
		display: flex;
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

	.header-content {
		display: flex;
		align-items: center;
		overflow: hidden;
		flex-grow: 1;
		min-width: 0;
		white-space: normal;
		overflow-wrap: break-word;
		word-break: normal;
		height: 100%;
		gap: var(--size-1);
	}

	.header-button {
		display: flex;
		text-align: left;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		display: flex;
		align-items: center;
		position: relative;
	}

	.sort-indicators {
		display: flex;
		align-items: center;
		margin-left: var(--size-1);
		gap: var(--size-1);
	}

	.sort-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--body-text-color);
	}

	.sort-priority {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--size-2);
		background-color: var(--button-secondary-background-fill);
		color: var(--body-text-color);
		border-radius: var(--radius-sm);
		width: var(--size-2-5);
		height: var(--size-2-5);
		padding: var(--size-1-5);
	}

	.filter-indicators {
		display: flex;
		align-items: center;
		margin-left: var(--size-1);
		gap: var(--size-1);
	}

	.filter-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--body-text-color);
	}

	.pinned-column {
		position: sticky;
		z-index: 5;
		border-right: none;
	}
</style>
