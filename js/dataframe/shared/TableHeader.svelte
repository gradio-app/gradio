<script lang="ts">
	import SortIcon from "./icons/SortIcon.svelte";
	import EditableCell from "./EditableCell.svelte";
	import CellMenuButton from "./CellMenuButton.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { SortDirection } from "./context/table_context";

	export let value: string;
	export let i: number;
	export let actual_pinned_columns: number;
	export let show_row_numbers: boolean;
	export let header_edit: number | false;
	export let selected_header: number | false;
	export let get_sort_status: (
		value: string,
		headers: string[]
	) => "none" | "asc" | "desc";
	export let headers: string[];
	export let get_cell_width: (index: number) => string;
	export let handle_header_click: (event: MouseEvent, col: number) => void;
	export let handle_sort: (col: number, direction: SortDirection) => void;
	export let toggle_header_menu: (event: MouseEvent, col: number) => void;
	export let end_header_edit: (event: CustomEvent<KeyboardEvent>) => void;
	export let sort_by: number | null;
	export let sort_direction: SortDirection | null;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let line_breaks: boolean;
	export let max_chars: number | undefined;
	export let root: string;
	export let editable: boolean;
	export let i18n: I18nFormatter;
	export let el: HTMLInputElement | null;

	function get_header_position(col_index: number): string {
		if (col_index >= actual_pinned_columns) {
			return "auto";
		}

		if (col_index === 0) {
			return show_row_numbers ? "var(--cell-width-row-number)" : "0";
		}

		const previous_widths = Array(col_index)
			.fill(0)
			.map((_, idx) => `var(--cell-width-${idx})`)
			.join(" + ");

		const row_number_width = show_row_numbers
			? "var(--cell-width-row-number) + "
			: "";

		return `calc(${row_number_width}${previous_widths})`;
	}
</script>

<th
	class:frozen-column={i < actual_pinned_columns}
	class:last-frozen={i === actual_pinned_columns - 1}
	class:focus={header_edit === i || selected_header === i}
	aria-sort={get_sort_status(value, headers) === "none"
		? "none"
		: get_sort_status(value, headers) === "asc"
			? "ascending"
			: "descending"}
	style="width: {get_cell_width(i)}; left: {get_header_position(i)};"
	on:click={(event) => handle_header_click(event, i)}
	on:mousedown={(event) => {
		event.preventDefault();
		event.stopPropagation();
	}}
>
	<div class="cell-wrap">
		<div class="header-content">
			{#if header_edit !== i}
				<div class="sort-buttons">
					<SortIcon
						direction={sort_by === i ? sort_direction : null}
						on:sort={({ detail }) => handle_sort(i, detail)}
						{i18n}
					/>
				</div>
			{/if}
			<button
				class="header-button"
				on:click={(event) => handle_header_click(event, i)}
				on:mousedown={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
			>
				<EditableCell
					{max_chars}
					bind:value
					bind:el
					{latex_delimiters}
					{line_breaks}
					edit={header_edit === i}
					on:keydown={end_header_edit}
					header
					{root}
					{editable}
					{i18n}
				/>
			</button>
		</div>
		{#if editable}
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
		text-align: left;
		width: 100%;
	}

	.sort-buttons {
		order: -1;
	}

	.frozen-column {
		position: sticky;
		z-index: 5;
		border-right: 1px solid var(--border-color-primary);
	}
</style>
