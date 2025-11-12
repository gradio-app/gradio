<script lang="ts">
	import { createEventDispatcher, setContext, tick, onMount } from "svelte";
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
	import type {
		Headers,
		DataframeValue,
		Datatype,
		EditData,
	} from "./utils/utils";
	import CellMenu from "./CellMenu.svelte";
	import Toolbar from "./Toolbar.svelte";
	import type { CellCoordinate, CellValue } from "./types";
	import {
		is_cell_selected,
		should_show_cell_menu,
		handle_click_outside as handle_click_outside_util,
		calculate_selection_positions,
		handle_selection,
	} from "./utils/selection_utils";
	import {
		copy_table_data,
		get_max,
		handle_file_upload,
	} from "./utils/table_utils";
	import { make_headers } from "./utils/data_processing";
	import {
		handle_keydown,
		handle_cell_blur,
		type KeyboardContext,
	} from "./utils/keyboard_utils";
	import {
		create_drag_handlers,
		type DragState,
		type DragHandlers,
	} from "./utils/drag_utils";
	import type { FilterDatatype } from "./utils/filter_utils";
	import {
		DataframeStore,
		DATAFRAME_STORE_KEY,
		type RowView,
		type SortDirection,
	} from "./state/DataframeStore.svelte";

	type TableProps = {
		datatype: Datatype | Datatype[];
		label?: string | null;
		show_label?: boolean;
		headers?: Headers;
		values?: CellValue[][];
		col_count: [number, "fixed" | "dynamic"];
		row_count: [number, "fixed" | "dynamic"];
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
		components?: Record<string, any>;
		editable?: boolean;
		wrap?: boolean;
		root: string;
		i18n: I18nFormatter;
		max_height?: number;
		line_breaks?: boolean;
		column_widths?: string[];
		show_row_numbers?: boolean;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		buttons?: string[] | null;
		value_is_output?: boolean;
		max_chars?: number;
		show_search?: "none" | "search" | "filter";
		pinned_columns?: number;
		static_columns?: (string | number)[];
		fullscreen?: boolean;
		display_value?: string[][] | null;
		styling?: string[][] | null;
	};

	let {
		datatype,
		label = null,
		show_label = true,
		headers = [],
		values = [],
		col_count,
		row_count,
		latex_delimiters,
		components = {},
		editable = true,
		wrap = false,
		root,
		i18n,
		max_height = 500,
		line_breaks = true,
		column_widths = [],
		show_row_numbers = false,
		upload,
		stream_handler,
		buttons = null,
		value_is_output = $bindable(false),
		max_chars = undefined,
		show_search = "none",
		pinned_columns = 0,
		static_columns = [],
		fullscreen = false,
		display_value = null,
		styling = null,
	}: TableProps = $props();

	const dataframeStore = new DataframeStore({
		value: {
			data: values,
			headers,
			metadata: display_value || styling ? { display_value, styling } : null,
		},
		datatype,
		pinned_columns,
		column_widths,
		max_height,
	});

	setContext(DATAFRAME_STORE_KEY, dataframeStore);

	const incomingValue = $derived<DataframeValue>({
		data: values,
		headers,
		metadata: display_value || styling ? { display_value, styling } : null,
	});
	const data = $derived(dataframeStore.data);
	const header_values = $derived(dataframeStore.headers);

	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLTextAreaElement }
	> = {};
	let previous_incoming_value: DataframeValue | null = null;
	let _headers = make_headers(headers, col_count, els, make_id);
	let old_headers: string[] = JSON.parse(JSON.stringify(headers));
	let dragging = false;
	let color_accent_copied: string;

	$effect(() => {
		if (
			!previous_incoming_value ||
			!dequal(previous_incoming_value, incomingValue)
		) {
			previous_incoming_value = JSON.parse(
				JSON.stringify(incomingValue),
			) as DataframeValue;
			dataframeStore.setValue(previous_incoming_value);
		}
	});

	$effect(() => {
		dataframeStore.config.pinned_columns = pinned_columns ?? 0;
		dataframeStore.config.column_widths = column_widths ?? [];
		dataframeStore.config.max_height = max_height ?? 500;
	});

	$effect(() => {
		const next_headers = header_values ?? [];
		if (!dequal(next_headers, old_headers)) {
			_headers = make_headers(next_headers, col_count, els, make_id);
			old_headers = JSON.parse(JSON.stringify(next_headers));
		}
	});

	$effect(() => {
		for (const row of data) {
			for (const cell of row) {
				if (!els[cell.id]) {
					els[cell.id] = { cell: null, input: null };
				}
			}
		}
	});

	const selected_cells = $derived(dataframeStore.selection.cells);
	const selected = $derived(dataframeStore.selectedCell || false);
	const editing = $derived(dataframeStore.selection.editing || false);
	const header_edit = $derived(dataframeStore.selection.headerEdit || false);
	const selected_header = $derived(
		dataframeStore.selection.selectedHeader || false,
	);
	const active_cell_menu = $derived(dataframeStore.ui.activeCellMenu);
	const active_header_menu = $derived(dataframeStore.ui.activeHeaderMenu);
	const copy_flash = $derived(dataframeStore.ui.copyFlash);

	const actual_pinned_columns = $derived(
		pinned_columns && data?.[0]?.length
			? Math.min(pinned_columns, data[0].length)
			: 0,
	);

	const sort_columns = $derived(dataframeStore.sort.columns);
	const filter_columns = $derived(dataframeStore.filter.columns);
	const current_search_query = $derived(dataframeStore.search.query);
	let selected_index: number | false = $state(false);

	onMount(() => {
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

	const dispatch = createEventDispatcher<{
		change: DataframeValue;
		input: undefined;
		select: SelectData;
		search: string | null;
		edit: EditData;
	}>();

	function buildChangePayload(): DataframeValue {
		return {
			data: dataframeStore.data.map((row) => row.map((cell) => cell.value)),
			headers: dataframeStore.headers.map((header) => header ?? ""),
			metadata: null,
		};
	}

	function emitTableChange(detail?: DataframeValue): void {
		const payload = detail ?? buildChangePayload();
		dispatch("change", payload);
		if (!value_is_output) {
			dispatch("input");
		}
	}

	const visible_rows = $derived(dataframeStore.visibleRows);

	const search_results = $derived(
		visible_rows.length === 0 ? [] : visible_rows.map((row) => row.cells),
	);
	const filtered_to_original_map = $derived(
		visible_rows.map((row) => row.rowIndex),
	);

	function handleSortAction(col: number, direction: SortDirection): void {
		dataframeStore.setSort(col, direction);
	}

	function handleFilterAction(
		col: number,
		datatype: FilterDatatype,
		filter: string,
		value: string,
	): void {
		dataframeStore.toggleFilter({ col, datatype, filter, value });
	}

	function handleSearchAction(query: string | null): void {
		dataframeStore.setSearch(query);
	}

	const df_actions = {
		reset_sort_state: () => dataframeStore.clearSort(),
		handle_sort: handleSortAction,
		update_row_order: () => {},
		reset_filter_state: () => dataframeStore.clearFilters(),
		handle_filter: handleFilterAction,
		handle_search: handleSearchAction,
		set_header_edit: (index: number | false) =>
			dataframeStore.setHeaderEdit(index),
		set_editing: (coords: CellCoordinate | false) =>
			dataframeStore.setEditing(coords),
		handle_header_click: (col: number, editable: boolean) => {
			if (!editable) return;
			dataframeStore.setActiveCellMenu(null);
			dataframeStore.setActiveHeaderMenu(null);
			dataframeStore.setSelected(false);
			dataframeStore.setSelectedCells([]);
			dataframeStore.setSelectedHeader(col);
			dataframeStore.setHeaderEdit(col);
		},
		end_header_edit: (key: string) => {
			if (["Escape", "Enter", "Tab"].includes(key)) {
				dataframeStore.setSelected(false);
				dataframeStore.setHeaderEdit(false);
				if (key !== "Escape") {
					dataframeStore.headers = _headers.map((header) => header.value ?? "");
					emitTableChange();
				}
			}
		},
		clear_ui_state: () => dataframeStore.clearUIState(),
		set_copy_flash: (value: boolean) => dataframeStore.setCopyFlash(value),
		set_active_header_menu: (
			menu: { col: number; x: number; y: number } | null,
		) => dataframeStore.setActiveHeaderMenu(menu),
		set_active_cell_menu: (
			menu: {
				row: number;
				col: number;
				x: number;
				y: number;
			} | null,
		) => dataframeStore.setActiveCellMenu(menu),
		set_selected_cells: (cells: CellCoordinate[]) =>
			dataframeStore.setSelectedCells(cells),
		set_selected: (cell: CellCoordinate | false) =>
			dataframeStore.setSelected(cell),
		handle_cell_click: (event: MouseEvent, row: number, col: number) => {
			event.preventDefault();
			event.stopPropagation();
			const cells = handle_selection([row, col], selected_cells, event);
			dataframeStore.setActiveCellMenu(null);
			dataframeStore.setActiveHeaderMenu(null);
			dataframeStore.setSelectedCells(cells);
			dataframeStore.setSelected(cells[0] ?? false);
			dataframeStore.setHeaderEdit(false);
			dataframeStore.setSelectedHeader(false);
			if (editable && cells.length === 1) {
				dataframeStore.setEditing([row, col]);
				tick().then(() => {
					const cellId = data[row][col].id;
					els[cellId]?.input?.focus();
				});
			} else {
				dataframeStore.setEditing(false);
			}
			dispatch("select", {
				index: [row, col],
				col_value: get_column(col),
				row_value: get_row(row),
				value: get_data_at(row, col),
			});
		},
		toggle_cell_menu: (event: MouseEvent, row: number, col: number) => {
			event.stopPropagation();
			const current_menu = active_cell_menu;
			if (current_menu?.row === row && current_menu.col === col) {
				dataframeStore.setActiveCellMenu(null);
				return;
			}
			const cell = (event.target as HTMLElement).closest("td");
			if (cell) {
				const rect = cell.getBoundingClientRect();
				dataframeStore.setActiveCellMenu({
					row,
					col,
					x: rect.right,
					y: rect.bottom,
				});
			}
		},
		handle_select_column: (col: number) => {
			if (!data) return;
			const cells = data.map(
				(_, rowIndex) => [rowIndex, col] as CellCoordinate,
			);
			dataframeStore.setSelectedCells(cells);
			dataframeStore.setSelected(cells[0] ?? false);
			dataframeStore.setEditing(false);
		},
		handle_select_row: (rowIndex: number) => {
			if (!data || !data[0]) return;
			const cells = data[0].map((_, col) => [rowIndex, col] as CellCoordinate);
			dataframeStore.setSelectedCells(cells);
			dataframeStore.setSelected(cells[0] ?? false);
			dataframeStore.setEditing(false);
		},
	};

	onMount(() => {
		const color = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-accent")
			.trim();
		color_accent_copied = color + "40"; // 80 is 50% opacity in hex
		document.documentElement.style.setProperty(
			"--color-accent-copied",
			color_accent_copied,
		);
	});

	const get_data_at = (row: number, col: number): CellValue =>
		data?.[row]?.[col]?.value;

	const get_column = (col: number): CellValue[] =>
		data?.map((row) => row[col]?.value) ?? [];

	const get_row = (row: number): CellValue[] =>
		data?.[row]?.map((cell) => cell.value) ?? [];

	function make_id(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	let last_data_structure = {
		rows: data.length,
		cols: data[0]?.length ?? 0,
	};

	$effect(() => {
		const rows = data.length;
		const cols = data[0]?.length ?? 0;
		const is_reset = rows === 0 || (rows === 1 && cols === 0);
		const changed =
			rows !== last_data_structure.rows || cols !== last_data_structure.cols;

		if (parent && (is_reset || changed)) {
			for (let i = 0; i < 50; i++) {
				parent.style.removeProperty(`--cell-width-${i}`);
			}
			last_width_data_length = 0;
			last_width_column_count = 0;
			width_calculated = false;
		}

		last_data_structure = { rows, cols };
	});

	function handle_sort(col: number, direction: SortDirection): void {
		df_actions.handle_sort(col, direction);
	}

	function clear_sort(): void {
		df_actions.reset_sort_state();
	}

	$effect(() => {
		if (sort_columns.length > 0) {
			df_actions.update_row_order();
		}
	});

	function handle_filter(
		col: number,
		datatype: FilterDatatype,
		filter: string,
		value: string,
	): void {
		df_actions.handle_filter(col, datatype, filter, value);
	}

	function clear_filter(): void {
		df_actions.reset_filter_state();
	}

	function handle_search(query: string | null): void {
		df_actions.handle_search(query);
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

		const currentLength = data.length;
		const insertIndex =
			index !== undefined && index >= 0 && index <= currentLength
				? index
				: currentLength;
		dataframeStore.addRow(insertIndex);

		const new_selection: CellCoordinate = [insertIndex, 0];
		dataframeStore.setSelectedCells([new_selection]);
		dataframeStore.setSelected(new_selection);
		dataframeStore.setEditing(new_selection);
		emitTableChange();
	}

	async function add_col(index?: number): Promise<void> {
		parent.focus();
		if (col_count[1] !== "dynamic") return;

		const currentCols = data[0]?.length ?? header_values.length ?? 0;
		const insertIndex =
			index !== undefined && index >= 0 && index <= currentCols
				? index
				: undefined;

		dataframeStore.addColumn(insertIndex);
		emitTableChange();

		await tick();

		requestAnimationFrame(() => {
			const totalCols = data[0]?.length ?? 0;
			const targetIndex =
				insertIndex !== undefined ? insertIndex : Math.max(totalCols - 1, 0);
			edit_header(targetIndex, true);
			const new_w = parent.querySelectorAll("tbody")[1].offsetWidth;
			parent.querySelectorAll("table")[1].scrollTo({ left: new_w });
		});
	}

	function handle_click_outside(event: Event): void {
		if (handle_click_outside_util(event, parent)) {
			df_actions.clear_ui_state();
		}
	}

	const max = $derived(get_max(data));

	let width_calc_timeout: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (cells[0] && cells[0]?.clientWidth) {
			clearTimeout(width_calc_timeout);
			width_calc_timeout = setTimeout(() => set_cell_widths(), 100);
		}
	});

	let width_calculated = false;
	$effect(() => {
		if (cells[0] && !width_calculated) {
			set_cell_widths();
			width_calculated = true;
		}
	});
	let cells: HTMLTableCellElement[] = [];
	let parent: HTMLDivElement;
	let table: HTMLTableElement;
	let last_width_data_length = 0;
	let last_width_column_count = 0;

	const emitKeyboardEvent = (
		event: "change" | "input",
		detail?: DataframeValue,
	): void => {
		if (event === "change") {
			emitTableChange(detail);
			return;
		}
		dispatch("input");
	};

	const keyboard_context: KeyboardContext = {
		get data() {
			return data;
		},
		get headers() {
			return _headers;
		},
		get els() {
			return els;
		},
		get parent_element() {
			return parent;
		},
		dispatch: emitKeyboardEvent,
		store: dataframeStore,
		get editable() {
			return editable;
		},
		get static_columns() {
			return static_columns;
		},
	};

	function set_cell_widths(): void {
		const column_count = data[0]?.length || 0;
		if (filter_columns.length > 0) {
			return;
		}
		if (
			last_width_data_length === data.length &&
			last_width_column_count === column_count &&
			sort_columns.length > 0
		) {
			return;
		}

		if (!parent) {
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
	let pendingUploadHeaders: string[] = [];

	$effect(() => {
		if (selected === false) {
			selected_index = false;
		} else {
			const mapped_index = filtered_to_original_map.indexOf(selected[0]);
			selected_index = mapped_index !== -1 ? mapped_index : false;
		}
	});

	let is_visible = false;

	const set_copy_flash = (value: boolean): void => {
		df_actions.set_copy_flash(value);
		if (value) {
			setTimeout(() => df_actions.set_copy_flash(false), 800);
		}
	};

	let previous_selected_cells: [number, number][] = [];

	$effect(() => {
		if (copy_flash && !dequal(selected_cells, previous_selected_cells)) {
			set_copy_flash(false);
		}
		// previous_selected_cells = selected_cells;
	});

	async function handle_blur(
		event: CustomEvent<{
			blur_event: FocusEvent;
			coords: [number, number];
		}>,
	): Promise<void> {
		const { blur_event, coords } = event.detail;
		await handle_cell_blur(blur_event, keyboard_context, coords);
		dataframeStore.updateCell(
			coords,
			data?.[coords[0]]?.[coords[1]]?.value ?? "",
		);
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
					y: rect.bottom,
				});
			}
		}
	}

	function delete_col_at(index: number): void {
		if (col_count[1] !== "dynamic") return;
		const columnCount = data[0]?.length ?? 0;
		if (columnCount <= 1 || index < 0 || index >= columnCount) return;

		dataframeStore.deleteColumn(index);
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
		df_actions.set_selected(false);
		df_actions.set_selected_cells([]);
		df_actions.set_editing(false);
		emitTableChange();
	}

	function delete_row_at(index: number): void {
		if (index < 0 || index >= data.length) return;
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
		dataframeStore.deleteRow(index);
		emitTableChange();
	}

	let selected_cell_coords: CellCoordinate;
	$effect(() => {
		if (selected !== false) {
			selected_cell_coords = selected;
		}
	});

	$effect(() => {
		if (selected !== false) {
			const positions = calculate_selection_positions(
				selected,
				data,
				els,
				parent,
				table,
			);
			document.documentElement.style.setProperty(
				"--selected-col-pos",
				positions.col_pos,
			);
			document.documentElement.style.setProperty(
				"--selected-row-pos",
				positions.row_pos || "0px",
			);
		}
	});

	function commit_filter(): void {
		console.log("commit filter");
		if (current_search_query && show_search === "filter") {
			const filtered_data: CellValue[][] = [];
			const filtered_display_values: string[][] = [];
			const filtered_styling: string[][] = [];

			search_results.forEach((row) => {
				const data_row: CellValue[] = [];
				const display_row: string[] = [];
				const styling_row: string[] = [];

				row.forEach((cell) => {
					data_row.push(cell.value);
					display_row.push(
						cell.display_value !== undefined
							? cell.display_value
							: String(cell.value),
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
					styling: filtered_styling,
				},
			};

			emitTableChange(change_payload);

			handle_search(null);
		}
	}

	let viewport: HTMLTableElement;
	let show_scroll_button = false;

	function scroll_to_top(): void {
		viewport.scrollTo({
			top: 0,
		});
	}

	function handle_resize(): void {
		df_actions.set_active_cell_menu(null);
		df_actions.set_active_header_menu(null);
		dataframeStore.setSelectedCells([]);
		dataframeStore.setSelected(false);
		dataframeStore.setEditing(false);
		width_calculated = false;
		set_cell_widths();
	}

	function add_row_at(index: number, position: "above" | "below"): void {
		const row_index = position === "above" ? index : index + 1;
		add_row(row_index);
		dataframeStore.setActiveCellMenu(null);
		dataframeStore.setActiveHeaderMenu(null);
	}

	function add_col_at(index: number, position: "left" | "right"): void {
		const col_index = position === "left" ? index : index + 1;
		add_col(col_index);
		dataframeStore.setActiveCellMenu(null);
		dataframeStore.setActiveHeaderMenu(null);
	}

	export function reset_sort_state(): void {
		df_actions.reset_sort_state();
	}

	function handle_select_all(col: number, checked: boolean): void {
		data.forEach((row, rowIndex) => {
			if (row[col]) {
				dataframeStore.updateCell([rowIndex, col], checked);
			}
		});
		emitTableChange();
	}

	let is_dragging = false;
	let drag_start: [number, number] | null = null;
	let mouse_down_pos: { x: number; y: number } | null = null;

	const drag_state: DragState = {
		is_dragging,
		drag_start,
		mouse_down_pos,
	};

	$effect(() => {
		is_dragging = drag_state.is_dragging;
		drag_start = drag_state.drag_start;
		mouse_down_pos = drag_state.mouse_down_pos;
	});

	let drag_handlers: DragHandlers;
	let handle_mouse_down: DragHandlers["handle_mouse_down"] = () => {};
	let handle_mouse_move: DragHandlers["handle_mouse_move"] = () => {};
	let handle_mouse_up: DragHandlers["handle_mouse_up"] = () => {};

	function init_drag_handlers(): void {
		drag_handlers = create_drag_handlers(
			drag_state,
			(value) => (is_dragging = value),
			(cells) => df_actions.set_selected_cells(cells),
			(cell) => df_actions.set_selected(cell),
			(event, row, col) => df_actions.handle_cell_click(event, row, col),
			show_row_numbers,
			parent,
		);
	}

	$effect(() => {
		if (parent) init_drag_handlers();
	});

	$effect(() => {
		handle_mouse_down = drag_handlers?.handle_mouse_down || (() => {});
		handle_mouse_move = drag_handlers?.handle_mouse_move || (() => {});
		handle_mouse_up = drag_handlers?.handle_mouse_up || (() => {});
	});

	function get_cell_display_value(row: number, col: number): string {
		const is_search_active = Boolean(current_search_query);

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

	async function _handle_keydown(
		e: KeyboardEvent,
		context: KeyboardContext,
	): Promise<void> {
		const result = await handle_keydown(e, context);

		// if (result) {
		// 	emitKeyboardEvent("change");
		// }
	}

	$inspect("Selected Cells", selected_cells);
</script>

<svelte:window on:resize={() => set_cell_widths()} />

<div class="table-container">
	{#if (label && label.length !== 0 && show_label) || (buttons === null ? true : buttons.includes("fullscreen")) || (buttons === null ? true : buttons.includes("copy")) || show_search !== "none"}
		<div class="header-row">
			{#if label && label.length !== 0 && show_label}
				<div class="label">
					<p>{label}</p>
				</div>
			{/if}
			<Toolbar
				show_fullscreen_button={buttons === null
					? true
					: buttons.includes("fullscreen")}
				{fullscreen}
				on_copy={async () => await copy_table_data(data, null)}
				show_copy_button={buttons === null ? true : buttons.includes("copy")}
				{show_search}
				on:search={(e) => handle_search(e.detail)}
				on:fullscreen
				on_commit_filter={commit_filter}
				{current_search_query}
			/>
		</div>
	{/if}
	<div
		bind:this={parent}
		class="table-wrap"
		class:dragging={is_dragging}
		class:no-wrap={!wrap}
		class:menu-open={active_cell_menu || active_header_menu}
		on:keydown={(e) => _handle_keydown(e, keyboard_context)}
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
							value={_headers[i].value}
							{i}
							{actual_pinned_columns}
							{header_edit}
							{selected_header}
							headers={header_values}
							{get_cell_width}
							{handle_header_click}
							{toggle_header_menu}
							{end_header_edit}
							{sort_columns}
							{filter_columns}
							{latex_delimiters}
							{line_breaks}
							{max_chars}
							{editable}
							is_static={static_columns.includes(i)}
							{i18n}
							bind:el={els[id].input}
							{col_count}
							datatype={Array.isArray(datatype) ? datatype[i] : datatype}
							{data}
							on_select_all={handle_select_all}
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
									on:keydown={(e) => handle_keydown(e, keyboard_context)}
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
						pendingUploadHeaders = head.map((h) => h ?? "");
					},
					(vals) => {
						const nextHeaders =
							pendingUploadHeaders.length > 0
								? pendingUploadHeaders
								: dataframeStore.headers;
						const nextValue: DataframeValue = {
							data: vals,
							headers: nextHeaders.map((header) => header ?? ""),
							metadata: null,
						};
						dataframeStore.setValue(nextValue);
						emitTableChange(nextValue);
						pendingUploadHeaders = [];
					},
				)}
			bind:dragging
			aria_label={i18n("dataframe.drop_to_upload")}
		>
			<div class="table-wrap">
				<VirtualTable
					items={search_results}
					{max_height}
					bind:actual_height={table_height}
					bind:table_scrollbar_width={scrollbar_width}
					selected={selected_index}
					disable_scroll={active_cell_menu !== null ||
						active_header_menu !== null}
					bind:viewport
					bind:show_scroll_button
					{label}
					on:scroll_top={(_) => {}}
				>
					<tr slot="thead">
						{#if show_row_numbers}
							<RowNumber is_header={true} />
						{/if}
						{#each _headers as { value, id }, i (id)}
							<TableHeader
								value={_headers[i].value}
								{i}
								{actual_pinned_columns}
								{header_edit}
								{selected_header}
								headers={header_values}
								{get_cell_width}
								{handle_header_click}
								{toggle_header_menu}
								{end_header_edit}
								{sort_columns}
								{filter_columns}
								{latex_delimiters}
								{line_breaks}
								{max_chars}
								{editable}
								is_static={static_columns.includes(i)}
								{i18n}
								bind:el={els[id].input}
								{col_count}
								datatype={Array.isArray(datatype) ? datatype[i] : datatype}
								{data}
								on_select_all={handle_select_all}
							/>
						{/each}
					</tr>
					<tr slot="tbody" let:item let:index class:row-odd={index % 2 === 0}>
						{#if show_row_numbers}
							<RowNumber {index} />
						{/if}
						{#each item as { value, id }, j (id)}
							<TableCell
								{value}
								display_value={get_cell_display_value(index, j)}
								index={current_search_query &&
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
		row={active_header_menu ? -1 : (active_cell_menu?.row ?? 0)}
		{col_count}
		{row_count}
		on_add_row_above={() => add_row_at(active_cell_menu?.row ?? -1, "above")}
		on_add_row_below={() => add_row_at(active_cell_menu?.row ?? -1, "below")}
		on_add_column_left={() =>
			add_col_at(
				active_cell_menu?.col ?? active_header_menu?.col ?? -1,
				"left",
			)}
		on_add_column_right={() =>
			add_col_at(
				active_cell_menu?.col ?? active_header_menu?.col ?? -1,
				"right",
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
			? (sort_columns.find(
					(item) => item.col === (active_header_menu?.col ?? -1),
				)?.direction ?? null)
			: null}
		sort_priority={active_header_menu
			? sort_columns.findIndex(
					(item) => item.col === (active_header_menu?.col ?? -1),
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
			? filter_columns.some((c) => c.col === (active_header_menu?.col ?? -1))
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
		font-family: var(--font-sans);
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
