<script lang="ts" context="module">
	import {
		create_dataframe_context,
		type SortDirection,
		type FilterDatatype
	} from "./context/dataframe_context";
</script>

<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick, onMount } from "svelte";
	import { dequal } from "dequal/lite";
	import { Upload } from "@gradio/upload";

	import EditableCell from "./EditableCell.svelte";
	import RowNumber from "./RowNumber.svelte";
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
		get_current_indices,
		handle_click_outside as handle_click_outside_util,
		calculate_selection_positions
	} from "./selection_utils";
	import {
		copy_table_data,
		get_max,
		handle_file_upload
	} from "./utils/table_utils";
	import { make_headers, process_data } from "./utils/data_processing";
	import { cast_value_to_type } from "./utils";
	import { handle_keydown, handle_cell_blur } from "./utils/keyboard_utils";
	import {
		create_drag_handlers,
		type DragState,
		type DragHandlers
	} from "./utils/drag_utils";
	import { sort_data_and_preserve_selection } from "./utils/sort_utils";
	import { filter_data_and_preserve_selection } from "./utils/filter_utils";

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
	export let fullscreen = false;

	const df_ctx = create_dataframe_context({
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
		max_chars,
		static_columns
	});

	const { state: df_state, actions: df_actions } = df_ctx;

	$: selected_cells = $df_state.ui_state.selected_cells;
	$: selected = $df_state.ui_state.selected;
	$: editing = $df_state.ui_state.editing;
	$: header_edit = $df_state.ui_state.header_edit;
	$: selected_header = $df_state.ui_state.selected_header;
	$: active_cell_menu = $df_state.ui_state.active_cell_menu;
	$: active_header_menu = $df_state.ui_state.active_header_menu;
	$: copy_flash = $df_state.ui_state.copy_flash;

	$: actual_pinned_columns =
		pinned_columns && data?.[0]?.length
			? Math.min(pinned_columns, data[0].length)
			: 0;

	onMount(() => {
		df_ctx.parent_element = parent;
		df_ctx.get_data_at = get_data_at;
		df_ctx.get_column = get_column;
		df_ctx.get_row = get_row;
		df_ctx.dispatch = dispatch;
		init_drag_handlers();

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !is_visible) {
					width_calculated = false;
				}
				is_visible = entry.isIntersecting;
			});
		});
		observer.observe(parent);
		document.addEventListener("click", handle_click_outside);
		window.addEventListener("resize", handle_resize);

		const global_mouse_up = (event: MouseEvent): void => {
			if (is_dragging || drag_start) {
				handle_mouse_up(event);
			}
		};
		document.addEventListener("mouseup", global_mouse_up);

		return () => {
			observer.disconnect();
			document.removeEventListener("click", handle_click_outside);
			window.removeEventListener("resize", handle_resize);
			document.removeEventListener("mouseup", global_mouse_up);
		};
	});

	$: {
		if (data || _headers || els) {
			df_ctx.data = data;
			df_ctx.headers = _headers;
			df_ctx.els = els;
			df_ctx.display_value = display_value;
			df_ctx.styling = styling;
		}
	}

	const dispatch = createEventDispatcher<{
		change: DataframeValue;
		input: undefined;
		select: SelectData;
		search: string | null;
	}>();

	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLTextAreaElement }
	> = {};
	let data_binding: Record<string, (typeof data)[0][0]> = {};
	let _headers = make_headers(headers, col_count, els, make_id);
	let old_headers: string[] = headers;
	let data: { id: string; value: string | number; display_value?: string }[][] =
		[[]];
	let old_val: undefined | (string | number)[][] = undefined;
	let search_results: {
		id: string;
		value: string | number;
		display_value?: string;
		styling?: string;
	}[][] = [[]];
	let dragging = false;
	let color_accent_copied: string;
	let filtered_to_original_map: number[] = [];

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

	const get_column = (col: number): (string | number)[] =>
		data?.map((row) => row[col]?.value) ?? [];

	const get_row = (row: number): (string | number)[] =>
		data?.[row]?.map((cell) => cell.value) ?? [];

	$: {
		if (!dequal(headers, old_headers)) {
			_headers = make_headers(headers, col_count, els, make_id);
			old_headers = JSON.parse(JSON.stringify(headers));
		}
	}

	function make_id(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	export let display_value: string[][] | null = null;
	export let styling: string[][] | null = null;

	$: if (!dequal(values, old_val)) {
		if (parent) {
			// only clear column widths when the data structure changes
			const is_reset =
				values.length === 0 || (values.length === 1 && values[0].length === 0);
			const is_different_structure =
				old_val !== undefined &&
				(values.length !== old_val.length ||
					(values[0] && old_val[0] && values[0].length !== old_val[0].length));

			if (is_reset || is_different_structure) {
				for (let i = 0; i < 50; i++) {
					parent.style.removeProperty(`--cell-width-${i}`);
				}
				last_width_data_length = 0;
				last_width_column_count = 0;
				width_calculated = false;
			}
		}

		// only reset sort state when values are changed
		const is_reset =
			values.length === 0 || (values.length === 1 && values[0].length === 0);
		const is_different_structure =
			old_val !== undefined &&
			(values.length !== old_val.length ||
				(values[0] && old_val[0] && values[0].length !== old_val[0].length));

		data = process_data(
			values as (string | number)[][],
			els,
			data_binding,
			make_id,
			display_value
		);
		old_val = JSON.parse(JSON.stringify(values)) as (string | number)[][];

		if (is_reset || is_different_structure) {
			df_actions.reset_sort_state();
		} else if ($df_state.sort_state.sort_columns.length > 0) {
			sort_data(data, display_value, styling);
		} else {
			df_actions.handle_sort(-1, "asc");
			df_actions.reset_sort_state();
		}

		if ($df_state.filter_state.filter_columns.length > 0) {
			filter_data(data, display_value, styling);
		} else {
			df_actions.reset_filter_state();
		}

		if ($df_state.current_search_query) {
			df_actions.handle_search(null);
		}

		if (parent && cells.length > 0 && (is_reset || is_different_structure)) {
			width_calculated = false;
		}
	}

	$: if ($df_state.current_search_query !== undefined) {
		const cell_map = new Map();
		filtered_to_original_map = [];

		data.forEach((row, row_idx) => {
			if (
				row.some((cell) =>
					String(cell?.value)
						.toLowerCase()
						.includes($df_state.current_search_query?.toLowerCase() || "")
				)
			) {
				filtered_to_original_map.push(row_idx);
			}
			row.forEach((cell, col_idx) => {
				cell_map.set(cell.id, {
					value: cell.value,
					display_value:
						cell.display_value !== undefined
							? cell.display_value
							: String(cell.value),
					styling: styling?.[row_idx]?.[col_idx] || ""
				});
			});
		});

		const filtered = df_actions.filter_data(data);

		search_results = filtered.map((row) =>
			row.map((cell) => {
				const original = cell_map.get(cell.id);
				return {
					...cell,
					display_value:
						original?.display_value !== undefined
							? original.display_value
							: String(cell.value),
					styling: original?.styling || ""
				};
			})
		);
	} else {
		filtered_to_original_map = [];
	}

	let previous_headers = _headers.map((h) => h.value);
	let previous_data = data.map((row) => row.map((cell) => String(cell.value)));

	$: {
		if (data || _headers) {
			df_actions.trigger_change(
				data.map((row, rowIdx) =>
					row.map((cell, colIdx) => {
						const dtype = Array.isArray(datatype) ? datatype[colIdx] : datatype;
						return {
							...cell,
							value: cast_value_to_type(cell.value, dtype)
						};
					})
				),
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
		sort_data(data, display_value, styling);
	}

	function clear_sort(): void {
		df_actions.reset_sort_state();
		sort_data(data, display_value, styling);
	}

	$: {
		if ($df_state.filter_state.filter_columns.length > 0) {
			filter_data(data, display_value, styling);
		}

		if ($df_state.sort_state.sort_columns.length > 0) {
			sort_data(data, display_value, styling);
			df_actions.update_row_order(data);
		}
	}

	function handle_filter(
		col: number,
		datatype: FilterDatatype,
		filter: string,
		value: string
	): void {
		df_actions.handle_filter(col, datatype, filter, value);
		filter_data(data, display_value, styling);
	}

	function clear_filter(): void {
		df_actions.reset_filter_state();
		filter_data(data, display_value, styling);
	}

	async function edit_header(i: number, _select = false): Promise<void> {
		if (!editable || header_edit === i || col_count[1] !== "dynamic") return;
		df_actions.set_header_edit(i);
	}

	function handle_header_click(event: MouseEvent, col: number): void {
		if (event.target instanceof HTMLAnchorElement) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (!editable) return;
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

	let width_calc_timeout: ReturnType<typeof setTimeout>;
	$: if (cells[0] && cells[0]?.clientWidth) {
		clearTimeout(width_calc_timeout);
		width_calc_timeout = setTimeout(() => set_cell_widths(), 100);
	}

	let width_calculated = false;
	$: if (cells[0] && !width_calculated) {
		set_cell_widths();
		width_calculated = true;
	}
	let cells: HTMLTableCellElement[] = [];
	let parent: HTMLDivElement;
	let table: HTMLTableElement;
	let last_width_data_length = 0;
	let last_width_column_count = 0;

	function set_cell_widths(): void {
		const column_count = data[0]?.length || 0;
		if ($df_state.filter_state.filter_columns.length > 0) {
			return;
		}
		if (
			last_width_data_length === data.length &&
			last_width_column_count === column_count &&
			$df_state.sort_state.sort_columns.length > 0
		) {
			return;
		}

		last_width_data_length = data.length;
		last_width_column_count = column_count;

		const widths = cells.map((el) => el?.clientWidth || 0);
		if (widths.length === 0) return;

		if (show_row_numbers) {
			parent.style.setProperty(`--cell-width-row-number`, `${widths[0]}px`);
		}

		for (let i = 0; i < 50; i++) {
			if (!column_widths[i]) {
				parent.style.removeProperty(`--cell-width-${i}`);
			} else if (column_widths[i].endsWith("%")) {
				const percentage = parseFloat(column_widths[i]);
				const pixel_width = Math.floor((percentage / 100) * parent.clientWidth);
				parent.style.setProperty(`--cell-width-${i}`, `${pixel_width}px`);
			} else {
				parent.style.setProperty(`--cell-width-${i}`, column_widths[i]);
			}
		}

		widths.forEach((width, i) => {
			if (!column_widths[i]) {
				const calculated_width = `${Math.max(width, 45)}px`;
				parent.style.setProperty(`--cell-width-${i}`, calculated_width);
			}
		});
	}

	function get_cell_width(index: number): string {
		return `var(--cell-width-${index})`;
	}

	let table_height: number =
		values.slice(0, (max_height / values.length) * 37).length * 37 + 37;
	let scrollbar_width = 0;

	function sort_data(
		_data: typeof data,
		_display_value: string[][] | null,
		_styling: string[][] | null
	): void {
		const result = sort_data_and_preserve_selection(
			_data,
			_display_value,
			_styling,
			$df_state.sort_state.sort_columns,
			selected,
			get_current_indices
		);

		data = result.data;
		selected = result.selected;
	}

	function filter_data(
		_data: typeof data,
		_display_value: string[][] | null,
		_styling: string[][] | null
	): void {
		const result = filter_data_and_preserve_selection(
			_data,
			_display_value,
			_styling,
			$df_state.filter_state.filter_columns,
			selected,
			get_current_indices,
			$df_state.filter_state.initial_data?.data,
			$df_state.filter_state.initial_data?.display_value,
			$df_state.filter_state.initial_data?.styling
		);
		data = result.data;
		selected = result.selected;
	}

	$: selected_index = !!selected && selected[0];

	let is_visible = false;

	const set_copy_flash = (value: boolean): void => {
		df_actions.set_copy_flash(value);
		if (value) {
			setTimeout(() => df_actions.set_copy_flash(false), 800);
		}
	};

	let previous_selected_cells: [number, number][] = [];

	$: {
		if (copy_flash && !dequal(selected_cells, previous_selected_cells)) {
			set_copy_flash(false);
		}
		previous_selected_cells = selected_cells;
	}

	function handle_blur(
		event: CustomEvent<{
			blur_event: FocusEvent;
			coords: [number, number];
		}>
	): void {
		const { blur_event, coords } = event.detail;
		handle_cell_blur(blur_event, df_ctx, coords);
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

	let selected_cell_coords: CellCoordinate;
	$: if (selected !== false) selected_cell_coords = selected;

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
		document.documentElement.style.setProperty(
			"--selected-row-pos",
			positions.row_pos || "0px"
		);
	}

	function commit_filter(): void {
		if ($df_state.current_search_query && show_search === "filter") {
			const filtered_data: (string | number)[][] = [];
			const filtered_display_values: string[][] = [];
			const filtered_styling: string[][] = [];

			search_results.forEach((row) => {
				const data_row: (string | number)[] = [];
				const display_row: string[] = [];
				const styling_row: string[] = [];

				row.forEach((cell) => {
					data_row.push(cell.value);
					display_row.push(
						cell.display_value !== undefined
							? cell.display_value
							: String(cell.value)
					);
					styling_row.push(cell.styling || "");
				});

				filtered_data.push(data_row);
				filtered_display_values.push(display_row);
				filtered_styling.push(styling_row);
			});

			const change_payload = {
				data: filtered_data,
				headers: _headers.map((h) => h.value),
				metadata: {
					display_value: filtered_display_values,
					styling: filtered_styling
				}
			};

			dispatch("change", change_payload);

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
		width_calculated = false;
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

	export function reset_sort_state(): void {
		df_actions.reset_sort_state();
	}

	let is_dragging = false;
	let drag_start: [number, number] | null = null;
	let mouse_down_pos: { x: number; y: number } | null = null;

	const drag_state: DragState = {
		is_dragging,
		drag_start,
		mouse_down_pos
	};

	$: {
		is_dragging = drag_state.is_dragging;
		drag_start = drag_state.drag_start;
		mouse_down_pos = drag_state.mouse_down_pos;
	}

	let drag_handlers: DragHandlers;

	function init_drag_handlers(): void {
		drag_handlers = create_drag_handlers(
			drag_state,
			(value) => (is_dragging = value),
			(cells) => df_actions.set_selected_cells(cells),
			(cell) => df_actions.set_selected(cell),
			(event, row, col) => df_actions.handle_cell_click(event, row, col),
			show_row_numbers,
			parent
		);
	}

	$: if (parent) init_drag_handlers();

	$: handle_mouse_down = drag_handlers?.handle_mouse_down || (() => {});
	$: handle_mouse_move = drag_handlers?.handle_mouse_move || (() => {});
	$: handle_mouse_up = drag_handlers?.handle_mouse_up || (() => {});

	function get_cell_display_value(row: number, col: number): string {
		const is_search_active = $df_state.current_search_query !== undefined;

		if (is_search_active && search_results?.[row]?.[col]) {
			return search_results[row][col].display_value !== undefined
				? search_results[row][col].display_value
				: String(search_results[row][col].value);
		}

		if (data?.[row]?.[col]) {
			return data[row][col].display_value !== undefined
				? data[row][col].display_value
				: String(data[row][col].value);
		}

		return "";
	}
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
				{fullscreen}
				on_copy={async () => await copy_table_data(data, null)}
				{show_copy_button}
				{show_search}
				on:search={(e) => df_actions.handle_search(e.detail)}
				on:fullscreen
				on_commit_filter={commit_filter}
				current_search_query={$df_state.current_search_query}
			/>
		</div>
	{/if}
	<div
		bind:this={parent}
		class="table-wrap"
		class:dragging={is_dragging}
		class:no-wrap={!wrap}
		style="height:{table_height}px;"
		class:menu-open={active_cell_menu || active_header_menu}
		on:keydown={(e) => handle_keydown(e, df_ctx)}
		on:mousemove={handle_mouse_move}
		on:mouseup={handle_mouse_up}
		on:mouseleave={handle_mouse_up}
		role="grid"
		tabindex="0"
	>
		<table bind:this={table} aria-hidden="true">
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
							{headers}
							{get_cell_width}
							{handle_header_click}
							{toggle_header_menu}
							{end_header_edit}
							sort_columns={$df_state.sort_state.sort_columns}
							filter_columns={$df_state.filter_state.filter_columns}
							{latex_delimiters}
							{line_breaks}
							{max_chars}
							{editable}
							is_static={static_columns.includes(i)}
							{i18n}
							bind:el={els[id].input}
							{col_count}
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
									{editable}
									{i18n}
									show_selection_buttons={selected_cells.length === 1 &&
										selected_cells[0][0] === 0 &&
										selected_cells[0][1] === j}
									coords={selected_cell_coords}
									on_select_column={df_actions.handle_select_column}
									on_select_row={df_actions.handle_select_row}
									{is_dragging}
									on:blur={handle_blur}
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
					bind:items={search_results}
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
								{headers}
								{get_cell_width}
								{handle_header_click}
								{toggle_header_menu}
								{end_header_edit}
								sort_columns={$df_state.sort_state.sort_columns}
								filter_columns={$df_state.filter_state.filter_columns}
								{latex_delimiters}
								{line_breaks}
								{max_chars}
								{editable}
								is_static={static_columns.includes(i)}
								{i18n}
								bind:el={els[id].input}
								{col_count}
							/>
						{/each}
					</tr>
					<tr slot="tbody" let:item let:index class:row-odd={index % 2 === 0}>
						{#if show_row_numbers}
							<RowNumber {index} />
						{/if}
						{#each item as { value, id }, j (id)}
							<TableCell
								bind:value={search_results[index][j].value}
								display_value={get_cell_display_value(index, j)}
								index={$df_state.current_search_query !== undefined &&
								filtered_to_original_map[index] !== undefined
									? filtered_to_original_map[index]
									: index}
								{j}
								{actual_pinned_columns}
								{get_cell_width}
								handle_cell_click={(e, r, c) => handle_mouse_down(e, r, c)}
								{handle_blur}
								toggle_cell_menu={df_actions.toggle_cell_menu}
								{is_cell_selected}
								{should_show_cell_menu}
								{selected_cells}
								{copy_flash}
								{active_cell_menu}
								styling={search_results[index][j].styling}
								{latex_delimiters}
								{line_breaks}
								datatype={Array.isArray(datatype) ? datatype[j] : datatype}
								{editing}
								{max_chars}
								{editable}
								is_static={static_columns.includes(j)}
								{i18n}
								{components}
								handle_select_column={df_actions.handle_select_column}
								handle_select_row={df_actions.handle_select_row}
								bind:el={els[id]}
								{is_dragging}
								{wrap}
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
		{editable}
		can_delete_rows={!active_header_menu && data.length > 1 && editable}
		can_delete_cols={data.length > 0 && data[0]?.length > 1 && editable}
		{i18n}
		on_sort={active_header_menu
			? (direction) => {
					if (active_header_menu) {
						handle_sort(active_header_menu.col, direction);
						df_actions.set_active_header_menu(null);
					}
				}
			: undefined}
		on_clear_sort={active_header_menu
			? () => {
					clear_sort();
					df_actions.set_active_header_menu(null);
				}
			: undefined}
		sort_direction={active_header_menu
			? $df_state.sort_state.sort_columns.find(
					(item) => item.col === (active_header_menu?.col ?? -1)
				)?.direction ?? null
			: null}
		sort_priority={active_header_menu
			? $df_state.sort_state.sort_columns.findIndex(
					(item) => item.col === (active_header_menu?.col ?? -1)
				) + 1 || null
			: null}
		on_filter={active_header_menu
			? (datatype, filter, value) => {
					if (active_header_menu) {
						handle_filter(active_header_menu.col, datatype, filter, value);
						df_actions.set_active_header_menu(null);
					}
				}
			: undefined}
		on_clear_filter={active_header_menu
			? () => {
					clear_filter();
					df_actions.set_active_header_menu(null);
				}
			: undefined}
		filter_active={active_header_menu
			? $df_state.filter_state.filter_columns.some(
					(c) => c.col === (active_header_menu?.col ?? -1)
				)
			: null}
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

	.table-wrap.dragging {
		cursor: crosshair !important;
		user-select: none;
	}

	.table-wrap.dragging * {
		cursor: crosshair !important;
		user-select: none;
	}

	.table-wrap > :global(button) {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
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

	tr {
		background: var(--table-even-background-fill);
	}

	tr.row-odd {
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
