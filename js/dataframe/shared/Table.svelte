<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick, onMount } from "svelte";
	import { dequal } from "dequal/lite";
	import { Upload } from "@gradio/upload";

	import EditableCell from "./EditableCell.svelte";
	import type { SelectData } from "@gradio/utils";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { type Client } from "@gradio/client";
	import VirtualTable from "./VirtualTable.svelte";
	import type {
		Headers,
		HeadersWithIDs,
		DataframeValue,
		Datatype
	} from "./utils";
	import CellMenu from "./CellMenu.svelte";
	import Toolbar from "./Toolbar.svelte";
	import SortIcon from "./icons/SortIcon.svelte";
	import type { CellCoordinate, EditingState } from "./types";
	import {
		is_cell_selected,
		handle_selection,
		handle_delete_key,
		should_show_cell_menu,
		get_next_cell_coordinates,
		get_range_selection,
		move_cursor,
		get_current_indices,
		handle_click_outside as handle_click_outside_util,
		select_column,
		select_row,
		calculate_selection_positions
	} from "./selection_utils";
	import {
		copy_table_data,
		get_max,
		handle_file_upload,
		sort_table_data
	} from "./utils/table_utils";

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

	let actual_pinned_columns = 0;
	$: actual_pinned_columns =
		pinned_columns && data?.[0]?.length
			? Math.min(pinned_columns, data[0].length)
			: 0;

	let selected_cells: CellCoordinate[] = [];
	$: selected_cells = [...selected_cells];
	let selected: CellCoordinate | false = false;
	$: selected =
		selected_cells.length > 0
			? selected_cells[selected_cells.length - 1]
			: false;

	export let display_value: string[][] | null = null;
	export let styling: string[][] | null = null;
	let t_rect: DOMRectReadOnly;
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

	let editing: EditingState = false;
	let clear_on_focus = false;
	let header_edit: number | false = false;
	let selected_header: number | false = false;
	let active_cell_menu: {
		row: number;
		col: number;
		x: number;
		y: number;
	} | null = null;
	let active_header_menu: {
		col: number;
		x: number;
		y: number;
	} | null = null;
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

	function make_headers(
		_head: Headers,
		col_count: [number, "fixed" | "dynamic"],
		els: Record<
			string,
			{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
		>
	): HeadersWithIDs {
		let _h = _head || [];
		if (col_count[1] === "fixed" && _h.length < col_count[0]) {
			const fill = Array(col_count[0] - _h.length)
				.fill("")
				.map((_, i) => `${i + _h.length}`);
			_h = _h.concat(fill);
		}

		if (!_h || _h.length === 0) {
			return Array(col_count[0])
				.fill(0)
				.map((_, i) => {
					const _id = make_id();
					els[_id] = { cell: null, input: null };
					return { id: _id, value: JSON.stringify(i + 1) };
				});
		}

		return _h.map((h, i) => {
			const _id = make_id();
			els[_id] = { cell: null, input: null };
			return { id: _id, value: h ?? "" };
		});
	}

	function process_data(_values: (string | number)[][]): {
		value: string | number;
		id: string;
	}[][] {
		const data_row_length = _values.length;
		if (data_row_length === 0) return [];
		return Array(row_count[1] === "fixed" ? row_count[0] : data_row_length)
			.fill(0)
			.map((_, i) => {
				return Array(
					col_count[1] === "fixed"
						? col_count[0]
						: _values[0].length || headers.length
				)
					.fill(0)
					.map((_, j) => {
						const id = make_id();
						els[id] = els[id] || { input: null, cell: null };
						const obj = { value: _values?.[i]?.[j] ?? "", id };
						data_binding[id] = obj;
						return obj;
					});
			});
	}

	let _headers = make_headers(headers, col_count, els);
	let old_headers: string[] = headers;

	$: {
		if (!dequal(headers, old_headers)) {
			_headers = make_headers(headers, col_count, els);
			old_headers = JSON.parse(JSON.stringify(headers));
		}
	}

	let data: { id: string; value: string | number }[][] = [[]];
	let old_val: undefined | (string | number)[][] = undefined;

	$: if (!dequal(values, old_val)) {
		data = process_data(values as (string | number)[][]);
		old_val = JSON.parse(JSON.stringify(values)) as (string | number)[][];
	}

	let previous_headers = _headers.map((h) => h.value);
	let previous_data = data.map((row) => row.map((cell) => String(cell.value)));

	async function trigger_change(): Promise<void> {
		// shouldnt trigger if data changed due to search
		if (current_search_query) return;
		const current_headers = _headers.map((h) => h.value);
		const current_data = data.map((row) =>
			row.map((cell) => String(cell.value))
		);

		if (
			!dequal(current_data, previous_data) ||
			!dequal(current_headers, previous_headers)
		) {
			// We dispatch the value as part of the change event to ensure that the value is updated
			// in the parent component and the updated value is passed into the user's function
			dispatch("change", {
				data: data.map((row) => row.map((cell) => cell.value)),
				headers: _headers.map((h) => h.value),
				metadata: null // the metadata (display value, styling) cannot be changed by the user so we don't need to pass it up
			});
			if (!value_is_output) {
				dispatch("input");
			}
			previous_data = current_data;
			previous_headers = current_headers;
		}
	}

	function get_sort_status(
		name: string,
		_sort?: number,
		direction?: SortDirection
	): "none" | "ascending" | "descending" {
		if (!_sort) return "none";
		if (headers[_sort] === name) {
			if (direction === "asc") return "ascending";
			if (direction === "des") return "descending";
		}
		return "none";
	}

	// eslint-disable-next-line complexity
	async function handle_keydown(event: KeyboardEvent): Promise<void> {
		if (selected_header !== false && header_edit === false) {
			switch (event.key) {
				case "ArrowDown":
					selected = [0, selected_header];
					selected_cells = [[0, selected_header]];
					selected_header = false;
					return;
				case "ArrowLeft":
					selected_header =
						selected_header > 0 ? selected_header - 1 : selected_header;
					return;
				case "ArrowRight":
					selected_header =
						selected_header < _headers.length - 1
							? selected_header + 1
							: selected_header;
					return;
				case "Escape":
					event.preventDefault();
					selected_header = false;
					break;
				case "Enter":
					event.preventDefault();
					if (editable) {
						header_edit = selected_header;
					}
					break;
			}
		}

		if (event.key === "Delete" || event.key === "Backspace") {
			if (!editable) return;

			if (editing) {
				const [row, col] = editing;
				const input_el = els[data[row][col].id].input;
				if (input_el && input_el.selectionStart !== input_el.selectionEnd) {
					return;
				}
				if (
					event.key === "Delete" &&
					input_el?.selectionStart !== input_el?.value.length
				) {
					return;
				}
				if (event.key === "Backspace" && input_el?.selectionStart !== 0) {
					return;
				}
			}

			event.preventDefault();
			if (selected_cells.length > 0) {
				data = handle_delete_key(data, selected_cells);
				dispatch("change", {
					data: data.map((row) => row.map((cell) => cell.value)),
					headers: _headers.map((h) => h.value),
					metadata: null
				});
				if (!value_is_output) {
					dispatch("input");
				}
			}
			return;
		}

		if (event.key === "c" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (selected_cells.length > 0) {
				await handle_copy();
			}
			return;
		}

		if (!selected) {
			return;
		}

		const [i, j] = selected;

		switch (event.key) {
			case "ArrowRight":
			case "ArrowLeft":
			case "ArrowDown":
			case "ArrowUp":
				if (editing) break;
				event.preventDefault();
				const next_coords = move_cursor(event.key, [i, j], data);
				if (next_coords) {
					if (event.shiftKey) {
						selected_cells = get_range_selection(
							selected_cells.length > 0 ? selected_cells[0] : [i, j],
							next_coords
						);
						editing = false;
					} else {
						selected_cells = [next_coords];
						editing = false;
					}
					selected = next_coords;
				} else if (
					next_coords === false &&
					event.key === "ArrowUp" &&
					i === 0
				) {
					selected_header = j;
					selected = false;
					selected_cells = [];
					editing = false;
				}
				break;

			case "Escape":
				if (!editable) break;
				event.preventDefault();
				editing = false;
				break;
			case "Enter":
				event.preventDefault();
				if (editable) {
					if (event.shiftKey) {
						add_row(i);
						await tick();
						selected = [i + 1, j];
					} else {
						if (dequal(editing, [i, j])) {
							const cell_id = data[i][j].id;
							const input_el = els[cell_id].input;
							if (input_el) {
								data[i][j].value = input_el.value;
							}
							editing = false;
							await tick();
							selected = [i, j];
						} else {
							editing = [i, j];
							clear_on_focus = false;
						}
					}
				}
				break;
			case "Tab":
				event.preventDefault();
				editing = false;
				const next_cell = get_next_cell_coordinates(
					[i, j],
					data,
					event.shiftKey
				);
				if (next_cell) {
					selected_cells = [next_cell];
					selected = next_cell;
					if (editable) {
						editing = next_cell;
						clear_on_focus = false;
					}
				}
				break;
			default:
				if (!editable) break;
				if (
					(!editing || (editing && dequal(editing, [i, j]))) &&
					event.key.length === 1
				) {
					clear_on_focus = true;
					editing = [i, j];
				}
		}
	}

	type SortDirection = "asc" | "des";
	let sort_direction: SortDirection | undefined;
	let sort_by: number | undefined;

	function handle_sort(col: number, direction: SortDirection): void {
		if (typeof sort_by !== "number" || sort_by !== col) {
			sort_direction = direction;
			sort_by = col;
		} else if (sort_by === col) {
			if (sort_direction === direction) {
				sort_direction = undefined;
				sort_by = undefined;
			} else {
				sort_direction = direction;
			}
		}
	}

	async function edit_header(i: number, _select = false): Promise<void> {
		if (!editable || header_edit === i) return;
		selected = false;
		selected_cells = [];
		selected_header = i;
		header_edit = i;
	}

	function end_header_edit(event: CustomEvent<KeyboardEvent>): void {
		if (!editable) return;

		switch (event.detail.key) {
			case "Escape":
			case "Enter":
			case "Tab":
				event.preventDefault();
				selected = false;
				selected_header = header_edit;
				header_edit = false;
				parent.focus();
				break;
		}
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

	$: (data || _headers) && trigger_change();

	async function add_col(index?: number): Promise<void> {
		parent.focus();
		if (col_count[1] !== "dynamic") return;

		const insert_index = index !== undefined ? index : data[0].length;

		for (let i = 0; i < data.length; i++) {
			const _id = make_id();
			els[_id] = { cell: null, input: null };
			data[i].splice(insert_index, 0, { id: _id, value: "" });
		}

		headers.splice(insert_index, 0, `Header ${headers.length + 1}`);

		data = data;
		headers = headers;

		await tick();

		requestAnimationFrame(() => {
			edit_header(insert_index, true);
			const new_w = parent.querySelectorAll("tbody")[1].offsetWidth;
			parent.querySelectorAll("table")[1].scrollTo({ left: new_w });
		});
	}

	function handle_click_outside(event: Event): void {
		if (handle_click_outside_util(event, parent)) {
			editing = false;
			selected_cells = [];
			header_edit = false;
			selected_header = false;
			active_cell_menu = null;
			active_header_menu = null;
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
		const data_cells = show_row_numbers ? widths.slice(1) : widths;
		data_cells.forEach((width, i) => {
			if (!column_widths[i]) {
				parent.style.setProperty(
					`--cell-width-${i}`,
					`${width - scrollbar_width / data_cells.length}px`
				);
			}
		});
	}

	function get_cell_width(index: number): string {
		return column_widths[index] || `var(--cell-width-${index})`;
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

	$: sort_data(data, display_value, styling, sort_by, sort_direction);

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

	function handle_cell_click(
		event: MouseEvent,
		row: number,
		col: number
	): void {
		if (event.target instanceof HTMLAnchorElement) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (show_row_numbers && col === -1) return;

		clear_on_focus = false;
		active_cell_menu = null;
		active_header_menu = null;
		selected_header = false;
		header_edit = false;

		selected_cells = handle_selection([row, col], selected_cells, event);
		parent.focus();

		if (editable) {
			if (selected_cells.length === 1) {
				editing = [row, col];
				tick().then(() => {
					const input_el = els[data[row][col].id].input;
					if (input_el) {
						input_el.focus();
						input_el.selectionStart = input_el.selectionEnd =
							input_el.value.length;
					}
				});
			} else {
				editing = false;
			}
		}

		toggle_cell_button(row, col);

		dispatch("select", {
			index: [row, col],
			value: get_data_at(row, col),
			row_value: data[row].map((d) => d.value)
		});
	}

	function toggle_cell_menu(event: MouseEvent, row: number, col: number): void {
		event.stopPropagation();
		if (
			active_cell_menu &&
			active_cell_menu.row === row &&
			active_cell_menu.col === col
		) {
			active_cell_menu = null;
		} else {
			const cell = (event.target as HTMLElement).closest("td");
			if (cell) {
				const rect = cell.getBoundingClientRect();
				active_cell_menu = { row, col, x: rect.right, y: rect.bottom };
			}
		}
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

	function handle_resize(): void {
		active_cell_menu = null;
		active_header_menu = null;
		selected_cells = [];
		selected = false;
		editing = false;
		set_cell_widths();
	}

	let active_button: {
		type: "header" | "cell";
		row?: number;
		col: number;
	} | null = null;

	function toggle_header_button(col: number): void {
		active_button =
			active_button?.type === "header" && active_button.col === col
				? null
				: { type: "header", col };
	}

	function toggle_cell_button(row: number, col: number): void {
		active_button =
			active_button?.type === "cell" &&
			active_button.row === row &&
			active_button.col === col
				? null
				: { type: "cell", row, col };
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

	async function handle_copy(): Promise<void> {
		await copy_table_data(data, selected_cells);
		copy_flash = true;
		setTimeout(() => {
			copy_flash = false;
		}, 800);
	}

	function toggle_header_menu(event: MouseEvent, col: number): void {
		event.stopPropagation();
		if (active_header_menu && active_header_menu.col === col) {
			active_header_menu = null;
		} else {
			const header = (event.target as HTMLElement).closest("th");
			if (header) {
				const rect = header.getBoundingClientRect();
				active_header_menu = { col, x: rect.right, y: rect.bottom };
			}
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});

	async function delete_row(index: number): Promise<void> {
		parent.focus();
		if (row_count[1] !== "dynamic") return;
		if (data.length <= 1) return;
		data.splice(index, 1);
		data = data;
		selected = false;
	}

	async function delete_col(index: number): Promise<void> {
		parent.focus();
		if (col_count[1] !== "dynamic") return;
		if (_headers.length <= 1) return;

		_headers.splice(index, 1);
		_headers = _headers;

		if (data.length > 0) {
			data.forEach((row) => {
				row.splice(index, 1);
			});
			data = data;
		}
		selected = false;
	}

	function delete_row_at(index: number): void {
		delete_row(index);
		active_cell_menu = null;
		active_header_menu = null;
	}

	function delete_col_at(index: number): void {
		delete_col(index);
		active_cell_menu = null;
		active_header_menu = null;
	}

	let row_order: number[] = [];

	$: {
		if (
			typeof sort_by === "number" &&
			sort_direction &&
			sort_by >= 0 &&
			sort_by < data[0].length
		) {
			const indices = [...Array(data.length)].map((_, i) => i);
			const sort_index = sort_by as number;
			indices.sort((a, b) => {
				const row_a = data[a];
				const row_b = data[b];
				if (
					!row_a ||
					!row_b ||
					sort_index >= row_a.length ||
					sort_index >= row_b.length
				)
					return 0;
				const val_a = row_a[sort_index].value;
				const val_b = row_b[sort_index].value;
				const comp = val_a < val_b ? -1 : val_a > val_b ? 1 : 0;
				return sort_direction === "asc" ? comp : -comp;
			});
			row_order = indices;
		} else {
			row_order = [...Array(data.length)].map((_, i) => i);
		}
	}

	function handle_select_column(col: number): void {
		selected_cells = select_column(data, col);
		selected = selected_cells[0];
		editing = false;
	}

	function handle_select_row(row: number): void {
		selected_cells = select_row(data, row);
		selected = selected_cells[0];
		editing = false;
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

	let current_search_query: string | null = null;

	function handle_search(search_query: string | null): void {
		current_search_query = search_query;
		dispatch("search", search_query);
	}

	function commit_filter(): void {
		if (current_search_query && show_search === "filter") {
			dispatch("change", {
				data: data.map((row) => row.map((cell) => cell.value)),
				headers: _headers.map((h) => h.value),
				metadata: null
			});
			if (!value_is_output) {
				dispatch("input");
			}
			current_search_query = null;
		}
	}

	function handle_header_click(event: MouseEvent, col: number): void {
		if (event.target instanceof HTMLAnchorElement) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (!editable) return;

		clear_on_focus = false;
		active_cell_menu = null;
		active_header_menu = null;
		selected = false;
		selected_cells = [];
		selected_header = col;
		header_edit = col;

		parent.focus();
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
				{is_fullscreen}
				on:click={toggle_fullscreen}
				on_copy={handle_copy}
				{show_copy_button}
				{show_search}
				on:search={(e) => handle_search(e.detail)}
				on_commit_filter={commit_filter}
				{current_search_query}
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
		on:keydown={(e) => handle_keydown(e)}
		role="grid"
		tabindex="0"
	>
		{#if selected !== false && selected_cells.length === 1}
			<button
				class="selection-button selection-button-column"
				on:click|stopPropagation={() => handle_select_column(coords[1])}
				aria-label="Select column"
			>
				&#8942;
			</button>
			<button
				class="selection-button selection-button-row"
				on:click|stopPropagation={() => handle_select_row(coords[0])}
				aria-label="Select row"
			>
				&#8942;
			</button>
		{/if}
		<table
			bind:contentRect={t_rect}
			bind:this={table}
			class:fixed-layout={column_widths.length != 0}
		>
			{#if label && label.length !== 0}
				<caption class="sr-only">{label}</caption>
			{/if}
			<thead>
				<tr>
					{#if show_row_numbers}
						<th
							class="row-number-header frozen-column always-frozen"
							style="left: 0;"
						>
							<div class="cell-wrap">
								<div class="header-content">
									<div class="header-text"></div>
								</div>
							</div>
						</th>
					{/if}
					{#each _headers as { value, id }, i (id)}
						<th
							class:frozen-column={i < actual_pinned_columns}
							class:last-frozen={i === actual_pinned_columns - 1}
							class:focus={header_edit === i || selected_header === i}
							aria-sort={get_sort_status(value, sort_by, sort_direction)}
							style="width: {get_cell_width(i)}; left: {i <
							actual_pinned_columns
								? i === 0
									? show_row_numbers
										? 'var(--cell-width-row-number)'
										: '0'
									: `calc(${show_row_numbers ? 'var(--cell-width-row-number) + ' : ''}${Array(
											i
										)
											.fill(0)
											.map((_, idx) => `var(--cell-width-${idx})`)
											.join(' + ')})`
								: 'auto'};"
							on:click={(event) => handle_header_click(event, i)}
							on:mousedown={(event) => {
								event.preventDefault();
								event.stopPropagation();
							}}
						>
							<div class="cell-wrap">
								<div class="header-content">
									<EditableCell
										{max_chars}
										bind:value={_headers[i].value}
										bind:el={els[id].input}
										{latex_delimiters}
										{line_breaks}
										edit={header_edit === i}
										on:keydown={end_header_edit}
										header
										{root}
										{editable}
									/>
									{#if header_edit !== i}
										<div class="sort-buttons">
											<SortIcon
												direction={sort_by === i ? sort_direction : null}
												on:sort={({ detail }) => handle_sort(i, detail)}
												{i18n}
											/>
										</div>
									{/if}
								</div>
								{#if editable}
									<button
										class="cell-menu-button"
										on:click={(event) => toggle_header_menu(event, i)}
										on:touchstart={(event) => {
											event.preventDefault();
											const touch = event.touches[0];
											const mouseEvent = new MouseEvent("click", {
												clientX: touch.clientX,
												clientY: touch.clientY,
												bubbles: true,
												cancelable: true,
												view: window
											});
											toggle_header_menu(mouseEvent, i);
										}}
									>
										&#8942;
									</button>
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				<tr>
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
							els
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
					bind:items={data}
					{max_height}
					bind:actual_height={table_height}
					bind:table_scrollbar_width={scrollbar_width}
					selected={selected_index}
					disable_scroll={active_cell_menu !== null ||
						active_header_menu !== null}
				>
					{#if label && label.length !== 0}
						<caption class="sr-only">{label}</caption>
					{/if}
					<tr slot="thead">
						{#if show_row_numbers}
							<th
								class="row-number-header frozen-column always-frozen"
								style="left: 0;"
							>
								<div class="cell-wrap">
									<div class="header-content">
										<div class="header-text"></div>
									</div>
								</div>
							</th>
						{/if}
						{#each _headers as { value, id }, i (id)}
							<th
								class:frozen-column={i < actual_pinned_columns}
								class:last-frozen={i === actual_pinned_columns - 1}
								class:focus={header_edit === i || selected_header === i}
								aria-sort={get_sort_status(value, sort_by, sort_direction)}
								style="width: {get_cell_width(i)}; left: {i <
								actual_pinned_columns
									? i === 0
										? show_row_numbers
											? 'var(--cell-width-row-number)'
											: '0'
										: `calc(${show_row_numbers ? 'var(--cell-width-row-number) + ' : ''}${Array(
												i
											)
												.fill(0)
												.map((_, idx) => `var(--cell-width-${idx})`)
												.join(' + ')})`
									: 'auto'};"
								on:click={(event) => handle_header_click(event, i)}
								on:mousedown={(event) => {
									event.preventDefault();
									event.stopPropagation();
								}}
							>
								<div class="cell-wrap">
									<div class="header-content">
										<EditableCell
											{max_chars}
											bind:value={_headers[i].value}
											bind:el={els[id].input}
											{latex_delimiters}
											{line_breaks}
											edit={header_edit === i}
											header
											{root}
											{editable}
										/>
										{#if header_edit !== i}
											<div class="sort-buttons">
												<SortIcon
													direction={sort_by === i ? sort_direction : null}
													on:sort={({ detail }) => handle_sort(i, detail)}
													{i18n}
												/>
											</div>
										{/if}
									</div>
									{#if editable}
										<button
											class="cell-menu-button"
											on:click={(event) => toggle_header_menu(event, i)}
											on:touchstart={(event) => {
												event.preventDefault();
												const touch = event.touches[0];
												const mouseEvent = new MouseEvent("click", {
													clientX: touch.clientX,
													clientY: touch.clientY,
													bubbles: true,
													cancelable: true,
													view: window
												});
												toggle_header_menu(mouseEvent, i);
											}}
										>
											&#8942;
										</button>
									{/if}
								</div>
							</th>
						{/each}
					</tr>
					<tr slot="tbody" let:item let:index class:row_odd={index % 2 === 0}>
						{#if show_row_numbers}
							<td
								class="row-number frozen-column always-frozen"
								style="left: 0;"
								tabindex="-1"
							>
								{index + 1}
							</td>
						{/if}
						{#each item as { value, id }, j (id)}
							<td
								class:frozen-column={j < actual_pinned_columns}
								class:last-frozen={j === actual_pinned_columns - 1}
								tabindex={show_row_numbers && j === 0 ? -1 : 0}
								bind:this={els[id].cell}
								on:touchstart={(event) => {
									const touch = event.touches[0];
									const mouseEvent = new MouseEvent("click", {
										clientX: touch.clientX,
										clientY: touch.clientY,
										bubbles: true,
										cancelable: true,
										view: window
									});
									handle_cell_click(mouseEvent, index, j);
								}}
								on:mousedown={(event) => {
									event.preventDefault();
									event.stopPropagation();
								}}
								on:click={(event) => handle_cell_click(event, index, j)}
								style="width: {get_cell_width(j)}; left: {j <
								actual_pinned_columns
									? j === 0
										? show_row_numbers
											? 'var(--cell-width-row-number)'
											: '0'
										: `calc(${show_row_numbers ? 'var(--cell-width-row-number) + ' : ''}${Array(
												j
											)
												.fill(0)
												.map((_, idx) => `var(--cell-width-${idx})`)
												.join(' + ')})`
									: 'auto'}; {styling?.[index]?.[j] || ''}"
								class:flash={copy_flash &&
									is_cell_selected([index, j], selected_cells)}
								class={is_cell_selected([index, j], selected_cells)}
								class:menu-active={active_cell_menu &&
									active_cell_menu.row === index &&
									active_cell_menu.col === j}
							>
								<div class="cell-wrap">
									<EditableCell
										bind:value={data[index][j].value}
										bind:el={els[id].input}
										display_value={display_value?.[index]?.[j]}
										{latex_delimiters}
										{line_breaks}
										{editable}
										edit={dequal(editing, [index, j])}
										datatype={Array.isArray(datatype) ? datatype[j] : datatype}
										on:blur={() => {
											clear_on_focus = false;
											parent.focus();
										}}
										on:focus={() => {
											const row = index;
											const col = j;
											if (
												!selected_cells.some(([r, c]) => r === row && c === col)
											) {
												selected_cells = [[row, col]];
											}
										}}
										{clear_on_focus}
										{root}
										{max_chars}
									/>
									{#if editable && should_show_cell_menu([index, j], selected_cells, editable)}
										<button
											class="cell-menu-button"
											on:click={(event) => toggle_cell_menu(event, index, j)}
										>
											&#8942;
										</button>
									{/if}
								</div>
							</td>
						{/each}
					</tr>
				</VirtualTable>
			</div>
		</Upload>
	</div>
</div>
{#if data.length === 0 && editable && row_count[1] === "dynamic"}
	<div class="add-row-container">
		<button class="add-row-button" on:click={() => add_row()}>
			<span>+</span>
		</button>
	</div>
{/if}

{#if active_cell_menu}
	<CellMenu
		x={active_cell_menu.x}
		y={active_cell_menu.y}
		row={active_cell_menu.row}
		{col_count}
		{row_count}
		on_add_row_above={() => add_row_at(active_cell_menu?.row || 0, "above")}
		on_add_row_below={() => add_row_at(active_cell_menu?.row || 0, "below")}
		on_add_column_left={() => add_col_at(active_cell_menu?.col || 0, "left")}
		on_add_column_right={() => add_col_at(active_cell_menu?.col || 0, "right")}
		on_delete_row={() => delete_row_at(active_cell_menu?.row || 0)}
		on_delete_col={() => delete_col_at(active_cell_menu?.col || 0)}
		can_delete_rows={data.length > 1}
		can_delete_cols={data[0].length > 1}
		{i18n}
	/>
{/if}

{#if active_header_menu !== null}
	<CellMenu
		{i18n}
		x={active_header_menu.x}
		y={active_header_menu.y}
		row={-1}
		{col_count}
		{row_count}
		on_add_row_above={() => add_row_at(active_cell_menu?.row ?? -1, "above")}
		on_add_row_below={() => add_row_at(active_cell_menu?.row ?? -1, "below")}
		on_add_column_left={() => add_col_at(active_header_menu?.col ?? -1, "left")}
		on_add_column_right={() =>
			add_col_at(active_header_menu?.col ?? -1, "right")}
		on_delete_row={() => delete_row_at(active_cell_menu?.row ?? -1)}
		on_delete_col={() => delete_col_at(active_header_menu?.col ?? -1)}
		can_delete_rows={false}
		can_delete_cols={_headers.length > 1}
	/>
{/if}

<style>
	.label p {
		position: relative;
		z-index: var(--layer-4);
		margin-bottom: var(--size-2);
		color: var(--block-label-text-color);
		font-size: var(--block-label-text-size);
	}

	.table-container {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
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

	.dragging {
		border-color: var(--color-accent);
	}

	.no-wrap {
		white-space: nowrap;
	}

	table {
		position: absolute;
		opacity: 0;
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

	.table-wrap > :global(button) {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
	}

	div:not(.no-wrap) td {
		overflow-wrap: anywhere;
	}

	div.no-wrap td {
		overflow-x: hidden;
	}

	table.fixed-layout {
		table-layout: fixed;
	}

	thead {
		position: sticky;
		top: 0;
		z-index: var(--layer-2);
		box-shadow: var(--shadow-drop);
	}

	tr {
		border-bottom: 1px solid var(--border-color-primary);
		text-align: left;
	}

	tr > * + * {
		border-right-width: 0px;
		border-left-width: 1px;
		border-style: solid;
		border-color: var(--border-color-primary);
	}

	th,
	td {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow: inset 0 0 0 1px var(--ring-color);
		padding: 0;
	}

	th:first-child {
		border-top-left-radius: var(--table-radius);
		border-bottom-left-radius: var(--table-radius);
	}

	th:last-child {
		border-top-right-radius: var(--table-radius);
		border-bottom-right-radius: var(--table-radius);
	}

	th.focus,
	td.focus {
		--ring-color: var(--color-accent);
		box-shadow: inset 0 0 0 2px var(--ring-color);
		z-index: var(--layer-1);
	}

	th.focus {
		z-index: var(--layer-2);
	}

	tr:last-child td:first-child {
		border-bottom-left-radius: var(--table-radius);
	}

	tr:last-child td:last-child {
		border-bottom-right-radius: var(--table-radius);
	}

	tr th {
		background: var(--table-even-background-fill);
	}

	.sort-buttons {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		order: -1;
	}

	.editing {
		background: var(--table-editing);
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

	.row_odd {
		background: var(--table-odd-background-fill);
	}

	.row_odd.focus {
		background: var(--background-fill-primary);
	}

	.cell-menu-button {
		flex-shrink: 0;
		display: none;
		background-color: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--block-radius);
		width: var(--size-5);
		height: var(--size-5);
		min-width: var(--size-5);
		padding: 0;
		margin-right: var(--spacing-sm);
		z-index: var(--layer-1);
		position: absolute;
		right: var(--size-1);
		top: 50%;
		transform: translateY(-50%);
	}

	.cell-selected .cell-menu-button,
	th:hover .cell-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
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

	.label {
		flex: 1 1 auto;
		margin-right: auto;
	}

	.label p {
		margin: 0;
		color: var(--block-label-text-color);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
	}

	.toolbar {
		flex: 0 0 auto;
	}

	.row-number,
	.row-number-header {
		text-align: center;
		background: var(--table-even-background-fill);
		font-size: var(--input-text-size);
		color: var(--body-text-color);
		padding: var(--size-1);
		min-width: var(--size-12);
		width: var(--size-12);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: var(--weight-semibold);
	}

	.row-number-header .header-content {
		justify-content: space-between;
		padding: var(--size-1);
		height: var(--size-9);
		display: flex;
		align-items: center;
	}

	.row-number-header :global(.sort-icons) {
		margin-right: 0;
	}

	:global(tbody > tr:nth-child(odd)) .row-number {
		background: var(--table-odd-background-fill);
	}

	.cell-selected {
		--ring-color: var(--color-accent);
		box-shadow: inset 0 0 0 2px var(--ring-color);
		z-index: var(--layer-1);
		position: relative;
	}

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

	.selection-button {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent);
		color: white;
		border-radius: var(--radius-sm);
		z-index: var(--layer-4);
	}

	.selection-button-column {
		width: var(--size-3);
		height: var(--size-5);
		top: -10px;
		left: var(--selected-col-pos);
		transform: rotate(90deg);
	}

	.selection-button-row {
		width: var(--size-3);
		height: var(--size-5);
		left: -7px;
		top: calc(var(--selected-row-pos) - var(--size-5) / 2);
	}

	.table-wrap:not(:focus-within) .selection-button {
		opacity: 0;
		pointer-events: none;
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

	.frozen-column {
		position: sticky;
		z-index: var(--layer-2);
		border-right: 1px solid var(--border-color-primary);
	}

	tr:nth-child(odd) .frozen-column {
		background: var(--table-odd-background-fill);
	}

	tr:nth-child(even) .frozen-column {
		background: var(--table-even-background-fill);
	}

	.always-frozen {
		z-index: var(--layer-3);
	}

	.add-row-container {
		margin-top: var(--size-2);
	}

	.add-row-button {
		width: 100%;
		padding: var(--size-1);
		background: transparent;
		border: 1px dashed var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		cursor: pointer;
		transition: all 150ms;
	}

	.add-row-button:hover {
		background: var(--background-fill-secondary);
		border-style: solid;
	}
</style>
