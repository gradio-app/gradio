<script lang="ts" context="module">
	import {
		type SortDirection,
		create_dataframe_context
	} from "./context/table_context";
	import { create_keyboard_context } from "./context/keyboard_context";
	import { create_selection_context } from "./context/selection_context";
</script>

<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick, onMount } from "svelte";
	import { dequal } from "dequal/lite";
	import { Upload } from "@gradio/upload";

	import EditableCell from "./EditableCell.svelte";
	import RowNumber from "./RowNumber.svelte";
	import SelectionButtons from "./SelectionButtons.svelte";
	import TableHeader from "./TableHeader.svelte";
	import TableCell from "./TableCell.svelte";
	import EmptyRowButton from "./EmptyRowButton.svelte";
	import type { SelectData } from "@gradio/utils";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { type Client } from "@gradio/client";
	import VirtualTable from "./VirtualTable.svelte";
	import type { Headers, DataframeValue, Datatype } from "./utils";
	import CellMenu from "./CellMenu.svelte";
	import Toolbar from "./Toolbar.svelte";
	import type { CellCoordinate } from "./types";
	import {
		is_cell_selected,
		should_show_cell_menu,
		get_next_cell_coordinates,
		get_range_selection,
		move_cursor,
		get_current_indices,
		handle_click_outside as handle_click_outside_util,
		calculate_selection_positions
	} from "./selection_utils";
	import {
		copy_table_data,
		get_max,
		handle_file_upload,
		sort_table_data
	} from "./utils/table_utils";
	import { make_headers, process_data } from "./utils/data_processing";
	import { handle_keydown } from "./utils/keyboard_utils";

	export let datatype: Datatype | Datatype[];
	export let label: string | null = null;
	export let show_label = true;
	export let headers: Headers = [];
	export let values: (string | number)[][] = [];
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let components: Record<string, any> = {};

	export let editable = true;
	export let wrap = false;
	export let root: string;
	export let i18n: I18nFormatter;

	export let max_height = 500;
	export let line_breaks = true;
	export let column_widths: string[] = [];
	export let show_row_numbers = false;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let show_fullscreen_button = false;
	export let show_copy_button = false;
	export let value_is_output = false;
	export let max_chars: number | undefined = undefined;
	export let show_search: "none" | "search" | "filter" = "none";
	export let pinned_columns = 0;
	export let static_columns: (string | number)[] = [];

	$: actual_pinned_columns =
		pinned_columns && data?.[0]?.length
			? Math.min(pinned_columns, data[0].length)
			: 0;

	const is_cell_static = (row_idx: number, col_idx: number): boolean => {
		return (
			static_columns.includes(col_idx) ||
			static_columns.includes(_headers[col_idx]?.value)
		);
	};

	const { state: df_state, actions: df_actions } = create_dataframe_context({
		show_fullscreen_button,
		show_copy_button,
		show_search,
		show_row_numbers,
		editable,
		pinned_columns,
		show_label,
		line_breaks,
		wrap,
		max_height,
		column_widths,
		max_chars
	});

	$: selected_cells = $df_state.ui_state.selected_cells; // $: {
	let previous_selected_cells: [number, number][] = [];
	$: {
		if (copy_flash && !dequal(selected_cells, previous_selected_cells)) {
			keyboard_ctx?.set_copy_flash(false);
		}
		previous_selected_cells = selected_cells;
	}
	$: selected = $df_state.ui_state.selected;

	export let display_value: string[][] | null = null;
	export let styling: string[][] | null = null;
	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	> = {};
	let data_binding: Record<string, (typeof data)[0][0]> = {};

	const dispatch = createEventDispatcher<{
		change: DataframeValue;
		input: undefined;
		select: SelectData;
		search: string | null;
	}>();

	$: editing = $df_state.ui_state.editing;
	let clear_on_focus = false;
	$: header_edit = $df_state.ui_state.header_edit;
	$: selected_header = $df_state.ui_state.selected_header;
	$: active_cell_menu = $df_state.ui_state.active_cell_menu;
	$: active_header_menu = $df_state.ui_state.active_header_menu;
	let is_fullscreen = false;
	let dragging = false;
	let copy_flash = false;

	let color_accent_copied: string;
	onMount(() => {
		const color = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-accent")
			.trim();
		color_accent_copied = color + "40"; // 80 is 50% opacity in hex
		document.documentElement.style.setProperty(
			"--color-accent-copied",
			color_accent_copied
		);
	});

	const get_data_at = (row: number, col: number): string | number =>
		data?.[row]?.[col]?.value;

	function make_id(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	let _headers = make_headers(headers, col_count, els, make_id);
	let old_headers: string[] = headers;

	$: {
		if (!dequal(headers, old_headers)) {
			_headers = make_headers(headers, col_count, els, make_id);
			old_headers = JSON.parse(JSON.stringify(headers));
		}
	}

	let data: { id: string; value: string | number }[][] = [[]];
	let old_val: undefined | (string | number)[][] = undefined;

	$: if (!dequal(values, old_val)) {
		data = process_data(
			values as (string | number)[][],
			row_count,
			col_count,
			headers,
			els,
			data_binding,
			make_id
		);
		old_val = JSON.parse(JSON.stringify(values)) as (string | number)[][];
		df_actions.reset_sort_state();
	}

	let previous_headers = _headers.map((h) => h.value);
	let previous_data = data.map((row) => row.map((cell) => String(cell.value)));

	$: {
		if (data || _headers) {
			df_actions.trigger_change(
				data,
				_headers,
				previous_data,
				previous_headers,
				value_is_output,
				dispatch
			);
			previous_data = data.map((row) => row.map((cell) => String(cell.value)));
			previous_headers = _headers.map((h) => h.value);
		}
	}

	function handle_sort(col: number, direction: SortDirection): void {
		df_actions.handle_sort(col, direction);
	}

	$: {
		df_actions.sort_data(data, display_value, styling);
		df_actions.update_row_order(data);
	}

	$: filtered_data = df_actions.filter_data(data);
	$: if ($df_state.current_search_query !== undefined) {
		filtered_data = df_actions.filter_data(data);
	}

	async function edit_header(i: number, _select = false): Promise<void> {
		if (!editable || header_edit === i) return;
		if (!editable || col_count[1] !== "dynamic" || header_edit === i) return;
		df_actions.set_header_edit(i);
	}

	function handle_header_click(event: MouseEvent, col: number): void {
		if (event.target instanceof HTMLAnchorElement) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (!editable) return;
		clear_on_focus = false;
		df_actions.set_editing(false);
		df_actions.handle_header_click(col, editable);
		parent.focus();
	}

	function end_header_edit(event: CustomEvent<KeyboardEvent>): void {
		if (!editable) return;
		df_actions.end_header_edit(event.detail.key);
		parent.focus();
	}

	async function add_row(index?: number): Promise<void> {
		parent.focus();

		if (row_count[1] !== "dynamic") return;

		const new_row = Array(data[0]?.length || headers.length)
			.fill(0)
			.map((_, i) => {
				const _id = make_id();
				els[_id] = { cell: null, input: null };
				return { id: _id, value: "" };
			});

		if (data.length === 0) {
			data = [new_row];
		} else if (index !== undefined && index >= 0 && index <= data.length) {
			data.splice(index, 0, new_row);
		} else {
			data.push(new_row);
		}

		data = data;
		selected = [index !== undefined ? index : data.length - 1, 0];
	}

	async function add_col(index?: number): Promise<void> {
		parent.focus();
		if (col_count[1] !== "dynamic") return;

		const result = df_actions.add_col(data, headers, make_id, index);

		result.data.forEach((row) => {
			row.forEach((cell) => {
				if (!els[cell.id]) {
					els[cell.id] = { cell: null, input: null };
				}
			});
		});

		data = result.data;
		headers = result.headers;

		await tick();

		requestAnimationFrame(() => {
			edit_header(index !== undefined ? index : data[0].length - 1, true);
			const new_w = parent.querySelectorAll("tbody")[1].offsetWidth;
			parent.querySelectorAll("table")[1].scrollTo({ left: new_w });
		});
	}

	function handle_click_outside(event: Event): void {
		if (handle_click_outside_util(event, parent)) {
			df_actions.clear_ui_state();
			header_edit = false;
			selected_header = false;
		}
	}

	$: max = get_max(data);

	$: cells[0] && set_cell_widths();
	let cells: HTMLTableCellElement[] = [];
	let parent: HTMLDivElement;
	let table: HTMLTableElement;

	function set_cell_widths(): void {
		const widths = cells.map((el) => el?.clientWidth || 0);
		if (widths.length === 0) return;

		if (show_row_numbers) {
			parent.style.setProperty(`--cell-width-row-number`, `${widths[0]}px`);
		}
		widths.forEach((width, i) => {
			if (!column_widths[i]) {
				parent.style.setProperty(
					`--cell-width-${i}`,
					`${width - scrollbar_width / widths.length}px`
				);
			}
		});
	}

	function get_cell_width(index: number): string {
		return column_widths[index]
			? `${column_widths[index]}`
			: `var(--cell-width-${index})`;
	}

	let table_height: number =
		values.slice(0, (max_height / values.length) * 37).length * 37 + 37;
	let scrollbar_width = 0;

	function sort_data(
		_data: typeof data,
		_display_value: string[][] | null,
		_styling: string[][] | null,
		col?: number,
		dir?: SortDirection
	): void {
		let id = null;
		if (selected && selected[0] in _data && selected[1] in _data[selected[0]]) {
			id = _data[selected[0]][selected[1]].id;
		}
		if (typeof col !== "number" || !dir) {
			return;
		}

		sort_table_data(_data, _display_value, _styling, col, dir);
		data = data;

		if (id) {
			const [i, j] = get_current_indices(id, data);
			selected = [i, j];
		}
	}

	$: sort_data(
		data,
		display_value,
		styling,
		$df_state.sort_state.sort_by === null
			? undefined
			: $df_state.sort_state.sort_by,
		$df_state.sort_state.sort_direction === null
			? undefined
			: $df_state.sort_state.sort_direction
	);

	$: selected_index = !!selected && selected[0];

	let is_visible = false;

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !is_visible) {
					set_cell_widths();
					data = data;
				}
				is_visible = entry.isIntersecting;
			});
		});

		observer.observe(parent);
		document.addEventListener("click", handle_click_outside);
		window.addEventListener("resize", handle_resize);
		document.addEventListener("fullscreenchange", handle_fullscreen_change);

		return () => {
			observer.disconnect();
			document.removeEventListener("click", handle_click_outside);
			window.removeEventListener("resize", handle_resize);
			document.removeEventListener(
				"fullscreenchange",
				handle_fullscreen_change
			);
		};
	});

	$: keyboard_ctx = create_keyboard_context({
		selected_header,
		header_edit,
		editing,
		selected,
		selected_cells,
		editable,
		data,
		headers: _headers,
		els,
		df_actions,
		dispatch,
		add_row,
		get_next_cell_coordinates,
		get_range_selection,
		move_cursor,
		copy_flash,
		set_copy_flash: (value: boolean) => {
			copy_flash = value;
			if (value) {
				setTimeout(() => {
					copy_flash = false;
				}, 800);
			}
		}
	});

	$: selection_ctx = create_selection_context({
		df_actions,
		dispatch,
		data,
		els,
		editable,
		show_row_numbers,
		get_data_at,
		clear_on_focus,
		selected_cells,
		parent_element: parent
	});

	function handle_cell_click(
		event: MouseEvent,
		row: number,
		col: number
	): void {
		selection_ctx.actions.handle_cell_click(event, row, col);
	}

	function toggle_cell_menu(event: MouseEvent, row: number, col: number): void {
		selection_ctx.actions.toggle_cell_menu(event, row, col);
	}

	function handle_select_column(col: number): void {
		selection_ctx.actions.handle_select_column(col);
	}

	function handle_select_row(row: number): void {
		selection_ctx.actions.handle_select_row(row);
	}

	function toggle_fullscreen(): void {
		if (!document.fullscreenElement) {
			parent.requestFullscreen();
			is_fullscreen = true;
		} else {
			document.exitFullscreen();
			is_fullscreen = false;
		}
	}

	function handle_fullscreen_change(): void {
		is_fullscreen = !!document.fullscreenElement;
	}

	function toggle_header_menu(event: MouseEvent, col: number): void {
		event.stopPropagation();
		if (active_header_menu && active_header_menu.col === col) {
			df_actions.set_active_header_menu(null);
		} else {
			const header = (event.target as HTMLElement).closest("th");
			if (header) {
				const rect = header.getBoundingClientRect();
				df_actions.set_active_header_menu({
					col,
					x: rect.right,
					y: rect.bottom
				});
			}
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});

	function delete_col_at(index: number): void {
		if (col_count[1] !== "dynamic") return;
		if (data[0].length <= 1) return;

		const result = df_actions.delete_col_at(data, headers, index);
		data = result.data;
		headers = result.headers;
		_headers = make_headers(headers, col_count, els, make_id);
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
		df_actions.set_selected(false);
		df_actions.set_selected_cells([]);
		df_actions.set_editing(false);
	}

	function delete_row_at(index: number): void {
		data = df_actions.delete_row_at(data, index);
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
	}

	let coords: CellCoordinate;
	$: if (selected !== false) coords = selected;

	$: if (selected !== false) {
		const positions = calculate_selection_positions(
			selected,
			data,
			els,
			parent,
			table
		);
		document.documentElement.style.setProperty(
			"--selected-col-pos",
			positions.col_pos
		);
		if (positions.row_pos) {
			document.documentElement.style.setProperty(
				"--selected-row-pos",
				positions.row_pos
			);
		}
	}

	function commit_filter(): void {
		if ($df_state.current_search_query && show_search === "filter") {
			dispatch("change", {
				data: filtered_data.map((row) => row.map((cell) => cell.value)),
				headers: _headers.map((h) => h.value),
				metadata: null
			});
			if (!value_is_output) {
				dispatch("input");
			}
			df_actions.handle_search(null);
		}
	}

	let viewport: HTMLTableElement;
	let show_scroll_button = false;

	function scroll_to_top(): void {
		viewport.scrollTo({
			top: 0
		});
	}

	function handle_resize(): void {
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
		selected_cells = [];
		selected = false;
		editing = false;
		set_cell_widths();
	}

	function add_row_at(index: number, position: "above" | "below"): void {
		const row_index = position === "above" ? index : index + 1;
		add_row(row_index);
		active_cell_menu = null;
		active_header_menu = null;
	}

	function add_col_at(index: number, position: "left" | "right"): void {
		const col_index = position === "left" ? index : index + 1;
		add_col(col_index);
		active_cell_menu = null;
		active_header_menu = null;
	}

	$: active_button = $df_state.ui_state.active_button;
</script>

<svelte:window on:resize={() => set_cell_widths()} />

<div class="table-container">
	{#if (label && label.length !== 0 && show_label) || show_fullscreen_button || show_copy_button || show_search !== "none"}
		<div class="header-row">
			{#if label && label.length !== 0 && show_label}
				<div class="label">
					<p>{label}</p>
				</div>
			{/if}
			<Toolbar
				{show_fullscreen_button}
				{is_fullscreen}
				on:click={toggle_fullscreen}
				on_copy={async () => await copy_table_data(data, null)}
				{show_copy_button}
				{show_search}
				on:search={(e) => df_actions.handle_search(e.detail)}
				on_commit_filter={commit_filter}
				current_search_query={$df_state.current_search_query}
			/>
		</div>
	{/if}
	<div
		bind:this={parent}
		class="table-wrap"
		class:dragging
		class:no-wrap={!wrap}
		style="height:{table_height}px;"
		class:menu-open={active_cell_menu || active_header_menu}
		on:keydown={(e) => handle_keydown(e, keyboard_ctx)}
		role="grid"
		tabindex="0"
	>
		{#if selected !== false && selected_cells.length === 1 && coords && coords[0] !== undefined && coords[1] !== undefined}
			<SelectionButtons
				{coords}
				on_select_column={handle_select_column}
				on_select_row={handle_select_row}
			/>
		{/if}
		<table bind:this={table} class:fixed-layout={column_widths.length != 0}>
			{#if label && label.length !== 0}
				<caption class="sr-only">{label}</caption>
			{/if}
			<thead>
				<tr>
					{#if show_row_numbers}
						<RowNumber is_header={true} />
					{/if}
					{#each _headers as { value, id }, i (id)}
						<TableHeader
							bind:value={_headers[i].value}
							{i}
							{actual_pinned_columns}
							{header_edit}
							{selected_header}
							get_sort_status={df_actions.get_sort_status}
							{headers}
							{get_cell_width}
							{handle_header_click}
							{handle_sort}
							{toggle_header_menu}
							{end_header_edit}
							sort_by={$df_state.sort_state.sort_by}
							sort_direction={$df_state.sort_state.sort_direction}
							{latex_delimiters}
							{line_breaks}
							{max_chars}
							{root}
							{editable}
							is_static={is_cell_static(i, i)}
							{i18n}
							bind:el={els[id].input}
						/>
					{/each}
				</tr>
			</thead>
			<tbody>
				<tr>
					{#if show_row_numbers}
						<RowNumber index={0} />
					{/if}
					{#each max as { value, id }, j (id)}
						<td tabindex="-1" bind:this={cells[j]}>
							<div class="cell-wrap">
								<EditableCell
									{value}
									{latex_delimiters}
									{line_breaks}
									datatype={Array.isArray(datatype) ? datatype[j] : datatype}
									edit={false}
									el={null}
									{root}
									{editable}
									{i18n}
								/>
							</div>
						</td>
					{/each}
				</tr>
			</tbody>
		</table>
		<Upload
			{upload}
			{stream_handler}
			flex={false}
			center={false}
			boundedheight={false}
			disable_click={true}
			{root}
			on:load={({ detail }) =>
				handle_file_upload(
					detail.data,
					(head) => {
						_headers = make_headers(
							head.map((h) => h ?? ""),
							col_count,
							els,
							make_id
						);
						return _headers;
					},
					(vals) => {
						values = vals;
					}
				)}
			bind:dragging
			aria_label={i18n("dataframe.drop_to_upload")}
		>
			<div class="table-wrap">
				<VirtualTable
					bind:items={filtered_data}
					{max_height}
					bind:actual_height={table_height}
					bind:table_scrollbar_width={scrollbar_width}
					selected={selected_index}
					disable_scroll={active_cell_menu !== null ||
						active_header_menu !== null}
					bind:viewport
					bind:show_scroll_button
					on:scroll_top={(_) => {}}
				>
					{#if label && label.length !== 0}
						<caption class="sr-only">{label}</caption>
					{/if}
					<tr slot="thead">
						{#if show_row_numbers}
							<RowNumber is_header={true} />
						{/if}
						{#each _headers as { value, id }, i (id)}
							<TableHeader
								bind:value={_headers[i].value}
								{i}
								{actual_pinned_columns}
								{header_edit}
								{selected_header}
								get_sort_status={df_actions.get_sort_status}
								{headers}
								{get_cell_width}
								{handle_header_click}
								{handle_sort}
								{toggle_header_menu}
								{end_header_edit}
								sort_by={$df_state.sort_state.sort_by}
								sort_direction={$df_state.sort_state.sort_direction}
								{latex_delimiters}
								{line_breaks}
								{max_chars}
								{root}
								{editable}
								is_static={is_cell_static(i, i)}
								{i18n}
								bind:el={els[id].input}
							/>
						{/each}
					</tr>
					<tr slot="tbody" let:item let:index class:row-odd={index % 2 === 0}>
						{#if show_row_numbers}
							<RowNumber {index} />
						{/if}
						{#each item as { value, id }, j (id)}
							<TableCell
								bind:value={filtered_data[index][j].value}
								{index}
								{j}
								{actual_pinned_columns}
								{get_cell_width}
								{handle_cell_click}
								{toggle_cell_menu}
								{is_cell_selected}
								{should_show_cell_menu}
								{selected_cells}
								{copy_flash}
								{active_cell_menu}
								display_value={display_value?.[index]?.[j]}
								styling={styling?.[index]?.[j]}
								{latex_delimiters}
								{line_breaks}
								datatype={Array.isArray(datatype) ? datatype[j] : datatype}
								{editing}
								{clear_on_focus}
								{max_chars}
								{root}
								{editable}
								is_static={is_cell_static(index, j)}
								{i18n}
								{components}
								bind:el={els[id]}
							/>
						{/each}
					</tr>
				</VirtualTable>
			</div>
		</Upload>
		{#if show_scroll_button}
			<button class="scroll-top-button" on:click={scroll_to_top}>
				&uarr;
			</button>
		{/if}
	</div>
</div>
{#if data.length === 0 && editable && row_count[1] === "dynamic"}
	<EmptyRowButton on_click={() => add_row()} />
{/if}

{#if active_cell_menu || active_header_menu}
	<CellMenu
		x={active_cell_menu?.x ?? active_header_menu?.x ?? 0}
		y={active_cell_menu?.y ?? active_header_menu?.y ?? 0}
		row={active_header_menu ? -1 : active_cell_menu?.row ?? 0}
		{col_count}
		{row_count}
		on_add_row_above={() => add_row_at(active_cell_menu?.row ?? -1, "above")}
		on_add_row_below={() => add_row_at(active_cell_menu?.row ?? -1, "below")}
		on_add_column_left={() =>
			add_col_at(
				active_cell_menu?.col ?? active_header_menu?.col ?? -1,
				"left"
			)}
		on_add_column_right={() =>
			add_col_at(
				active_cell_menu?.col ?? active_header_menu?.col ?? -1,
				"right"
			)}
		on_delete_row={() => delete_row_at(active_cell_menu?.row ?? -1)}
		on_delete_col={() =>
			delete_col_at(active_cell_menu?.col ?? active_header_menu?.col ?? -1)}
		can_delete_rows={!active_header_menu && data.length > 1}
		can_delete_cols={data.length > 0 && data[0]?.length > 1}
		{i18n}
	/>
{/if}

<style>
	.table-container {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		position: relative;
	}

	.table-wrap {
		position: relative;
		transition: 150ms;
	}

	.table-wrap.menu-open {
		overflow: hidden;
	}

	.table-wrap:focus-within {
		outline: none;
	}

	.table-wrap > :global(button) {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
	}

	.table-wrap:not(:focus-within) :global(.selection-button),
	.table-wrap.menu-open :global(.selection-button) {
		opacity: 0;
		pointer-events: none;
	}

	table {
		position: absolute;
		opacity: 0;
		z-index: -1;
		transition: 150ms;
		width: var(--size-full);
		table-layout: auto;
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-md);
		font-family: var(--font-mono);
		border-spacing: 0;
		border-collapse: separate;
	}

	table.fixed-layout {
		table-layout: fixed;
	}

	thead {
		position: sticky;
		top: 0;
		z-index: 5;
		box-shadow: var(--shadow-drop);
	}

	thead :global(th.pinned-column) {
		position: sticky;
		z-index: 6;
		background: var(--table-even-background-fill) !important;
	}

	.dragging {
		border-color: var(--color-accent);
	}

	.no-wrap {
		white-space: nowrap;
	}

	div:not(.no-wrap) td {
		overflow-wrap: anywhere;
	}

	div.no-wrap td {
		overflow-x: hidden;
	}

	.row-odd {
		background: var(--table-odd-background-fill);
	}

	.header-row {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--size-2);
		min-height: var(--size-6);
		flex-wrap: nowrap;
		width: 100%;
	}

	.header-row .label {
		flex: 1 1 auto;
		margin-right: auto;
	}

	.header-row .label p {
		margin: 0;
		color: var(--block-label-text-color);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
		position: relative;
		z-index: 4;
	}

	.scroll-top-button {
		position: absolute;
		right: var(--size-4);
		bottom: var(--size-4);
		width: var(--size-8);
		height: var(--size-8);
		border-radius: var(--table-radius);
		background: var(--color-accent);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		z-index: 9;
		opacity: 0.5;
	}

	.scroll-top-button:hover {
		opacity: 1;
	}

	tr {
		border-bottom: 1px solid var(--border-color-primary);
		text-align: left;
	}
</style>
