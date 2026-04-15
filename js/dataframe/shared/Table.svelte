<script lang="ts">
	import {
		createSvelteTable,
		createSvelteVirtualizer,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type ColumnDef,
		type SortingState,
		type ColumnFiltersState,
		type ColumnPinningState
	} from "./tanstack/index.js";
	import { tick, onMount } from "svelte";
	import { Upload } from "@gradio/upload";

	import HeaderCell from "./HeaderCell.svelte";
	import DataCell from "./DataCell.svelte";
	import EmptyRowButton from "./EmptyRowButton.svelte";
	import type { SelectData } from "@gradio/utils";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { type Client } from "@gradio/client";
	import type { Datatype, DataframeValue, EditData } from "./utils/utils";
	import { cast_value_to_type } from "./utils/utils";
	import CellMenu from "./CellMenu.svelte";
	import Toolbar from "./Toolbar.svelte";
	import type {
		CellValue,
		CellCoordinate,
		SortDirection,
		FilterDatatype
	} from "./types";
	import {
		is_cell_in_selection,
		is_cell_selected,
		handle_click_outside as handle_click_outside_util
	} from "./utils/selection_utils";
	import { copy_table_data, handle_file_upload } from "./utils/table_utils";
	import { gradio_filter_fn } from "./utils/filter";
	import { create_column_measurement } from "./column_measurement.svelte.js";

	let {
		datatype,
		label = null,
		show_label = true,
		headers = $bindable([]),
		values = $bindable([]),
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
		onchange,
		oninput,
		onselect,
		onedit,
		onsearch,
		onfullscreen
	}: {
		datatype: Datatype | Datatype[];
		label?: string | null;
		show_label?: boolean;
		headers?: (string | null)[];
		values?: CellValue[][];
		col_count: [number, "fixed" | "dynamic"];
		row_count: [number, "fixed" | "dynamic"];
		latex_delimiters: { left: string; right: string; display: boolean }[];
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
		max_chars?: number | undefined;
		show_search?: "none" | "search" | "filter";
		pinned_columns?: number;
		static_columns?: (string | number)[];
		fullscreen?: boolean;
		display_value?: string[][] | null;
		styling?: string[][] | null;
		onchange?: (detail: DataframeValue) => void;
		oninput?: () => void;
		onselect?: (detail: SelectData) => void;
		onedit?: (detail: EditData) => void;
		onsearch?: (detail: string | null) => void;
		onfullscreen?: () => void;
	} = $props();

	type GradioRow = Record<string, CellValue> & { _index: number };

	// convert values[][] into tanstack row objects
	let row_data: GradioRow[] = $derived(
		(values ?? []).map((row, i) => {
			const obj: GradioRow = { _index: i };
			(row ?? []).forEach((val, j) => {
				const dtype = Array.isArray(datatype) ? datatype[j] : datatype;
				obj[`col_${j}`] = cast_value_to_type(val, dtype);
			});
			return obj;
		})
	);

	let resolved_headers = $derived.by(() => {
		let h = headers ?? [];
		if (col_count[1] === "fixed" && h.length < col_count[0]) {
			h = [
				...h,
				...Array(col_count[0] - h.length)
					.fill(null)
					.map((_, i) => `${i + h.length}`)
			];
		}
		if (!h.length) {
			h = Array(col_count[0])
				.fill(null)
				.map((_, i) => `${i}`);
		}
		return h.map((v) => v ?? "");
	});

	let column_defs: ColumnDef<GradioRow, CellValue>[] = $derived(
		resolved_headers.map((header_value, j) => ({
			id: `col_${j}`,
			accessorKey: `col_${j}`,
			header: header_value,
			size: column_widths[j] ? parseInt(column_widths[j]) || 150 : 150,
			minSize: 45,
			filterFn: gradio_filter_fn,
			meta: {
				colIndex: j,
				datatype: Array.isArray(datatype) ? datatype[j] : datatype,
				isStatic:
					static_columns.includes(j) || static_columns.includes(header_value),
				isPinned: j < pinned_columns
			}
		}))
	);

	let sorting: SortingState = $state([]);
	let column_filters: ColumnFiltersState = $state([]);
	let global_filter: string = $state("");
	let column_pinning: ColumnPinningState = $derived({
		left: column_defs.filter((_, i) => i < pinned_columns).map((c) => c.id!)
	});

	const table = createSvelteTable<GradioRow>({
		get data() {
			return row_data;
		},
		get columns() {
			return column_defs;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return column_filters;
			},
			get globalFilter() {
				return global_filter;
			},
			get columnPinning() {
				return column_pinning;
			}
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === "function" ? updater(sorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			column_filters =
				typeof updater === "function" ? updater(column_filters) : updater;
		},
		onGlobalFilterChange: (updater) => {
			global_filter =
				typeof updater === "function" ? updater(global_filter) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: "includesString",
		enableSorting: true,
		enableMultiSort: true,
		maxMultiSortColCount: 3
	});

	let rows = $derived(table.getRowModel().rows);
	let header_groups = $derived(table.getHeaderGroups());

	let scroll_container: HTMLDivElement;

	const virtualizer = createSvelteVirtualizer<
		HTMLDivElement,
		HTMLTableRowElement
	>({
		get count() {
			return rows.length;
		},
		getScrollElement: () => scroll_container,
		estimateSize: () => 35,
		overscan: 10,
		measureElement: (el, _entry, instance) => {
			const h = el.getBoundingClientRect().height;
			if (h > 0) return h;

			const idx = el.getAttribute("data-index");
			if (idx != null) {
				const cached = (instance as any).itemSizeCache?.get(Number(idx));
				if (typeof cached === "number") return cached;
			}
			return 35;
		}
	});

	let virtual_items = $derived(virtualizer.virtualItems());
	let total_size = $derived(virtualizer.totalSize());

	let selected_cells: CellCoordinate[] = $state([]);
	let selected: CellCoordinate | false = $state(false);
	let editing: CellCoordinate | false = $state(false);
	let header_edit: number | false = $state(false);
	let selected_header: number | false = $state(false);
	let active_cell_menu: {
		row: number;
		col: number;
		x: number;
		y: number;
	} | null = $state(null);
	let active_header_menu: { col: number; x: number; y: number } | null =
		$state(null);
	let copy_flash = $state(false);
	let is_dragging = $state(false);
	let show_scroll_button = $state(false);
	let dragging = $state(false); // file drag

	let parent: HTMLDivElement;

	function get_dtype(col: number): Datatype {
		return Array.isArray(datatype) ? (datatype[col] ?? "str") : datatype;
	}

	function get_display_value(row: number, col: number): string {
		if (display_value?.[row]?.[col] !== undefined)
			return display_value[row][col];
		return String(values?.[row]?.[col] ?? "");
	}

	function get_styling(row: number, col: number): string {
		return styling?.[row]?.[col] ?? "";
	}

	function push_change(
		new_values?: CellValue[][],
		new_headers?: (string | null)[]
	): void {
		onchange?.({
			data: new_values ?? values,
			headers: (new_headers ?? resolved_headers) as string[],
			metadata: null
		});
		if (!value_is_output) oninput?.();
		value_is_output = false;
	}

	function handle_cell_click(
		event: MouseEvent,
		row: number,
		col: number
	): void {
		const col_is_static =
			!editable ||
			static_columns.includes(col) ||
			static_columns.includes(resolved_headers[col]);
		if (!col_is_static) {
			event.preventDefault();
		}
		event.stopPropagation();

		const coord: CellCoordinate = [row, col];
		if (event.shiftKey && selected) {
			// range select
			const [r1, c1] = selected;
			const [r2, c2] = coord;
			const new_cells: CellCoordinate[] = [];
			for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
				for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
					new_cells.push([r, c]);
				}
			}
			selected_cells = new_cells;
		} else if (event.metaKey || event.ctrlKey) {
			// toggle select
			const exists = selected_cells.some(([r, c]) => r === row && c === col);
			selected_cells = exists
				? selected_cells.filter(([r, c]) => !(r === row && c === col))
				: [...selected_cells, coord];
		} else {
			selected_cells = [coord];
		}

		selected = coord;
		header_edit = false;
		selected_header = false;
		active_cell_menu = null;
		active_header_menu = null;

		// click selects, does NOT enter edit mode (double-click or typing does)
		editing = false;

		onselect?.({
			index: coord,
			value: values?.[row]?.[col],
			row_value: values?.[row] ?? [],
			col_value: values?.map((r) => r[col]) ?? []
		} as any);

		if (!col_is_static) {
			tick().then(() => parent?.focus());
		}
	}

	function handle_cell_dblclick(
		event: MouseEvent,
		row: number,
		col: number
	): void {
		const col_is_static =
			!editable ||
			static_columns.includes(col) ||
			static_columns.includes(resolved_headers[col]);
		if (col_is_static) return;
		event.preventDefault();
		event.stopPropagation();
		editing = [row, col];
	}

	function handle_blur(detail: {
		blur_event: FocusEvent;
		coords: [number, number];
	}): void {
		const { coords } = detail;
		const input_el = detail.blur_event.target as HTMLTextAreaElement;
		if (!input_el || input_el.value === undefined) return;

		const [row, col] = coords;
		const old_value = values?.[row]?.[col];
		const new_value = input_el.value;

		if (String(old_value) !== String(new_value)) {
			const new_values = values.map((r) => [...r]);
			new_values[row][col] = new_value;
			values = new_values;

			onedit?.({
				index: [row, col],
				value: new_value,
				previous_value: String(old_value ?? "")
			});
			push_change(new_values);
		}
	}

	function handle_header_click(event: MouseEvent, col: number): void {
		if (event.target instanceof HTMLAnchorElement) return;
		event.preventDefault();
		event.stopPropagation();
		if (!editable) return;

		editing = false;
		selected = false;
		selected_cells = [];
		active_cell_menu = null;
		active_header_menu = null;
		selected_header = col;
		header_edit = editable ? col : false;
		parent?.focus();
	}

	function end_header_edit(key: string): void {
		if (["Escape", "Enter", "Tab"].includes(key)) {
			header_edit = false;
			parent?.focus();
		}
	}

	function toggle_header_menu(event: MouseEvent, col: number): void {
		event.stopPropagation();
		if (active_header_menu?.col === col) {
			active_header_menu = null;
		} else {
			const th = (event.target as HTMLElement).closest("th");
			if (th) {
				const rect = th.getBoundingClientRect();
				active_header_menu = { col, x: rect.right, y: rect.bottom };
			}
		}
	}

	function handle_sort(col: number, direction: SortDirection): void {
		const col_id = `col_${col}`;
		const desc = direction === "desc";
		// if already sorted this way, remove it
		const existing = sorting.findIndex((s) => s.id === col_id);
		if (existing >= 0 && sorting[existing].desc === desc) {
			sorting = sorting.filter((s) => s.id !== col_id);
		} else {
			sorting = [
				...sorting.filter((s) => s.id !== col_id),
				{ id: col_id, desc }
			].slice(-3);
		}
	}

	function clear_sort(): void {
		sorting = [];
	}

	function handle_filter(
		col: number,
		dtype: FilterDatatype,
		filter: string,
		fvalue: string
	): void {
		const col_id = `col_${col}`;
		const existing = column_filters.findIndex((f) => f.id === col_id);
		if (existing >= 0) {
			column_filters = column_filters.filter((f) => f.id !== col_id);
		} else {
			column_filters = [
				...column_filters,
				{ id: col_id, value: { dtype, filter, value: fvalue } }
			];
		}
	}

	function clear_filter(): void {
		column_filters = [];
	}

	function handle_search(query: string | null): void {
		global_filter = query ?? "";
		onsearch?.(query);
	}

	function add_row(index?: number): void {
		if (row_count[1] !== "dynamic") return;
		const col_len = values[0]?.length || resolved_headers.length || 1;
		const new_row: CellValue[] = Array(col_len).fill("");
		const new_values = [...values];
		if (index !== undefined) {
			new_values.splice(index, 0, new_row);
		} else {
			new_values.push(new_row);
		}
		values = new_values;
		push_change(new_values);
		selected = [index ?? new_values.length - 1, 0];
		parent?.focus();
	}

	function add_col(index?: number): void {
		if (col_count[1] !== "dynamic") return;
		const new_headers = [
			...(headers ?? []),
			`Header ${(headers?.length ?? 0) + 1}`
		];
		const new_values = values.map((row) => [...row, ""]);
		if (index !== undefined) {
			new_headers.splice(index, 0, new_headers.pop()!);
			new_values.forEach((row) => row.splice(index, 0, row.pop()!));
		}
		values = new_values;
		headers = new_headers;
		push_change(new_values, new_headers);
		parent?.focus();
	}

	function delete_row_at(index: number): void {
		if (values.length <= 1) return;
		values = [...values.slice(0, index), ...values.slice(index + 1)];
		push_change(values);
		active_cell_menu = null;
		active_header_menu = null;
	}

	function delete_col_at(index: number): void {
		if (col_count[1] !== "dynamic") return;
		if ((values[0]?.length ?? 0) <= 1) return;
		values = values.map((row) => [
			...row.slice(0, index),
			...row.slice(index + 1)
		]);
		headers = [
			...(headers ?? []).slice(0, index),
			...(headers ?? []).slice(index + 1)
		];
		push_change(values, headers as string[]);
		active_cell_menu = null;
		active_header_menu = null;
		selected = false;
		selected_cells = [];
		editing = false;
	}

	function add_row_at(index: number, position: "above" | "below"): void {
		add_row(position === "above" ? index : index + 1);
		active_cell_menu = null;
	}

	function add_col_at(index: number, position: "left" | "right"): void {
		add_col(position === "left" ? index : index + 1);
		active_cell_menu = null;
	}

	function handle_select_all(col: number, checked: boolean): void {
		const new_values = values.map((row) => {
			const new_row = [...row];
			new_row[col] = checked;
			return new_row;
		});
		values = new_values;
		push_change(new_values);
	}

	function get_select_all_state(
		col: number
	): "checked" | "unchecked" | "indeterminate" {
		if (!values.length) return "unchecked";
		let true_count = 0;
		for (const row of values) {
			const v = row[col];
			if (v === true || v === "true" || v === "True") true_count++;
		}
		if (true_count === 0) return "unchecked";
		if (true_count === values.length) return "checked";
		return "indeterminate";
	}

	function commit_filter(): void {
		if (!global_filter || show_search !== "filter") return;
		// get the filtered rows from tanstack and push as new values
		const filtered_values = rows.map((row) => {
			const original_idx = row.original._index;
			return values[original_idx];
		});
		values = filtered_values;
		global_filter = "";
		push_change(filtered_values);
	}

	async function handle_copy(): Promise<void> {
		const data_for_copy = values.map((row) =>
			row.map((val, j) => ({ id: `${j}`, value: val }))
		);
		const cells_to_copy = selected_cells.length > 0 ? selected_cells : null;
		await copy_table_data(data_for_copy, cells_to_copy);
		copy_flash = true;
		setTimeout(() => (copy_flash = false), 800);
	}

	function handle_click_outside(event: Event): void {
		if (handle_click_outside_util(event, parent)) {
			selected_cells = [];
			selected = false;
			editing = false;
			header_edit = false;
			selected_header = false;
			active_cell_menu = null;
			active_header_menu = null;
		}
	}

	function handle_keydown(e: KeyboardEvent): void {
		if (!selected && selected_header === false) return;

		const num_rows = rows.length;
		const num_cols = resolved_headers.length;

		if (selected) {
			const [row, col] = selected;

			switch (e.key) {
				case "ArrowUp":
					e.preventDefault();
					if (row > 0) {
						selected = [row - 1, col];
						selected_cells = [selected];
						editing = false;
						virtualizer.instance.scrollToIndex(row - 1, { align: "auto" });
					}
					break;
				case "ArrowDown":
					e.preventDefault();
					if (row < num_rows - 1) {
						selected = [row + 1, col];
						selected_cells = [selected];
						editing = false;
						virtualizer.instance.scrollToIndex(row + 1, { align: "auto" });
					}
					break;
				case "ArrowLeft":
					e.preventDefault();
					if (col > 0) {
						selected = [row, col - 1];
						selected_cells = [selected];
						editing = false;
					}
					break;
				case "ArrowRight":
					e.preventDefault();
					if (col < num_cols - 1) {
						selected = [row, col + 1];
						selected_cells = [selected];
						editing = false;
					}
					break;
				case "Tab": {
					e.preventDefault();
					const was_editing = !!editing;
					if (e.shiftKey) {
						if (col > 0) selected = [row, col - 1];
						else if (row > 0) selected = [row - 1, num_cols - 1];
					} else {
						if (col < num_cols - 1) selected = [row, col + 1];
						else if (row < num_rows - 1) selected = [row + 1, 0];
					}
					selected_cells = [selected];
					if (was_editing) {
						const tab_col = (selected as CellCoordinate)[1];
						const tab_static =
							static_columns.includes(tab_col) ||
							static_columns.includes(resolved_headers[tab_col]);
						editing = editable && !tab_static ? selected : false;
					} else {
						editing = false;
					}
					if (!editing) tick().then(() => parent?.focus());
					break;
				}
				case "Enter":
					if (editing && e.shiftKey) {
						// shift+enter inserts newline in textarea — don't intercept
						return;
					}
					e.preventDefault();
					if (editing) {
						editing = false;
						if (row < num_rows - 1) {
							selected = [row + 1, col];
							selected_cells = [selected];
						}
						tick().then(() => parent?.focus());
					} else if (editable) {
						const enter_static =
							static_columns.includes(col) ||
							static_columns.includes(resolved_headers[col]);
						if (!enter_static) {
							editing = [row, col];
						}
					}
					break;
				case "Escape":
					editing = false;
					tick().then(() => parent?.focus());
					break;
				case "Delete":
				case "Backspace":
					if (!editing && editable) {
						e.preventDefault();
						const new_values = values.map((r) => [...r]);
						selected_cells.forEach(([r, c]) => {
							if (!static_columns.includes(c)) {
								new_values[r][c] = "";
							}
						});
						values = new_values;
						push_change(new_values);
					}
					break;
				default:
					// start editing on printable character
					if (
						editable &&
						!editing &&
						e.key.length === 1 &&
						!e.ctrlKey &&
						!e.metaKey &&
						!static_columns.includes(col)
					) {
						editing = [row, col];
					}
					break;
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "c") {
				handle_copy();
			}
		}
	}

	function handle_scroll(): void {
		if (scroll_container) {
			show_scroll_button = scroll_container.scrollTop > 100;
		}
	}

	function scroll_to_top(): void {
		scroll_container?.scrollTo({ top: 0 });
	}

	function toggle_cell_menu(event: MouseEvent, row: number, col: number): void {
		event.stopPropagation();
		if (active_cell_menu?.row === row && active_cell_menu.col === col) {
			active_cell_menu = null;
		} else {
			const cell = (event.target as HTMLElement).closest(".body-cell, td");
			if (cell) {
				const rect = cell.getBoundingClientRect();
				active_cell_menu = { row, col, x: rect.right, y: rect.bottom };
			}
		}
	}

	function on_file_upload(file_data: any): void {
		handle_file_upload(
			typeof file_data === "string" ? file_data : (file_data?.data ?? ""),
			(head) => {
				headers = head.map((h: any) => h ?? "");
				return (headers as string[]).map((h: string, i: number) => ({
					id: `h_${i}`,
					value: h
				}));
			},
			(vals) => {
				values = vals;
				push_change(vals, headers as string[]);
			}
		);
	}

	onMount(() => {
		document.addEventListener("click", handle_click_outside);
		return () => document.removeEventListener("click", handle_click_outside);
	});

	function measure_row(node: HTMLElement) {
		tick().then(() => {
			console.log("measuring");
			virtualizer.instance.measureElement(node as any);
		});

		return {
			destroy() {}
		};
	}

	let header_row_el: HTMLTableRowElement;
	let header_table_el: HTMLTableElement;

	const measurement = create_column_measurement({
		header_row_el: () => header_row_el,
		header_table_el: () => header_table_el,
		resolved_headers: () => resolved_headers,
		row_data: () => row_data,
		show_row_numbers: () => show_row_numbers,
		column_widths: () => column_widths,
		on_resize: undefined
	});

	let disable_scroll = $derived(
		active_cell_menu !== null || active_header_menu !== null
	);
	let selected_index = $derived(selected !== false ? selected[0] : false);

	$effect(() => {
		if (typeof selected_index === "number") {
			virtualizer.instance.scrollToIndex(selected_index, { align: "auto" });
		}
	});

	function get_sort_info(col: number): {
		direction: SortDirection | null;
		priority: number | null;
	} {
		const col_id = `col_${col}`;
		const idx = sorting.findIndex((s) => s.id === col_id);
		if (idx === -1) return { direction: null, priority: null };
		return { direction: sorting[idx].desc ? "desc" : "asc", priority: idx + 1 };
	}

	function get_filter_active(col: number): boolean {
		return column_filters.some((f) => f.id === `col_${col}`);
	}
</script>

<svelte:window
	onresize={() => {
		active_cell_menu = null;
		active_header_menu = null;
	}}
/>

<div class="table-container" class:fullscreen>
	{#if (label && label.length !== 0 && show_label) || (buttons === null ? true : buttons.includes("fullscreen")) || (buttons === null ? true : buttons.includes("copy")) || show_search !== "none"}
		<div class="header-row">
			{#if label && label.length !== 0 && show_label}
				<div class="label"><p>{label}</p></div>
			{/if}
			<Toolbar
				show_fullscreen_button={buttons === null
					? true
					: buttons.includes("fullscreen")}
				{fullscreen}
				on_copy={handle_copy}
				show_copy_button={buttons === null ? true : buttons.includes("copy")}
				{show_search}
				onsearch={(query) => handle_search(query)}
				{onfullscreen}
				on_commit_filter={commit_filter}
				current_search_query={global_filter || null}
			/>
		</div>
	{/if}

	<div
		bind:this={parent}
		class="table-wrap"
		class:dragging={is_dragging}
		class:no-wrap={!wrap}
		class:menu-open={active_cell_menu || active_header_menu}
		onkeydown={handle_keydown}
		role="grid"
		tabindex="0"
	>
		<Upload
			{upload}
			{stream_handler}
			flex={false}
			center={false}
			boundedheight={false}
			disable_click={true}
			{root}
			onload={on_file_upload}
			bind:dragging
			aria_label={i18n("dataframe.drop_to_upload")}
		>
			<div
				class="virtual-table-viewport"
				class:disable-scroll={disable_scroll}
				bind:this={scroll_container}
				onscroll={handle_scroll}
				style="max-height: {max_height}px;"
				role="grid"
			>
				{#if label && label.length !== 0}
					<span class="sr-only">{label}</span>
				{/if}
				<!-- header row: uses table layout to auto-size columns by content -->
				<table class="header-table" bind:this={header_table_el}>
					<thead>
						<tr bind:this={header_row_el}>
							{#if show_row_numbers}
								<th class="row-number-header">&nbsp;</th>
							{/if}
							{#each header_groups as headerGroup (headerGroup.id)}
								{#each headerGroup.headers as header (header.id)}
									{@const col_idx =
										(header.column.columnDef.meta as any)?.colIndex ?? 0}
									<HeaderCell
										value={String(header.column.columnDef.header ?? "")}
										{col_idx}
										is_editing={header_edit === col_idx}
										is_selected={selected_header === col_idx}
										is_static={!!(header.column.columnDef.meta as any)
											?.isStatic}
										is_bool={get_dtype(col_idx) === "bool"}
										select_all_state={get_select_all_state(col_idx)}
										sort_direction={get_sort_info(col_idx).direction}
										sort_priority={get_sort_info(col_idx).priority}
										multi_sort={sorting.length > 1}
										is_filtered={get_filter_active(col_idx)}
										show_menu_button={col_count[1] === "dynamic"}
										is_first_column={col_idx === 0 && !show_row_numbers}
										{latex_delimiters}
										{line_breaks}
										{editable}
										{max_chars}
										{i18n}
										onclick={handle_header_click}
										on_menu_click={toggle_header_menu}
										on_end_edit={end_header_edit}
										on_select_all={handle_select_all}
									/>
								{/each}
							{/each}
						</tr>
					</thead>
					<!-- hidden sizing row: lets table-layout:auto consider body content widths too -->
					<tbody class="sizing-body" aria-hidden="true">
						{#if rows.length > 0}
							{@const sizing_row = rows.reduce((widest, row) => {
								const cells = row.getVisibleCells();
								cells.forEach((cell, i) => {
									const val = String(cell.getValue() ?? "");
									if (!widest[i] || val.length > widest[i].length) {
										widest[i] = val;
									}
								});
								return widest;
							}, [] as string[])}
							<tr>
								{#if show_row_numbers}
									<td class="row-number-cell">{rows.length}</td>
								{/if}
								{#each sizing_row as val, ci}
									{@const dtype = get_dtype(ci)}
									<td
										><div class="cell-wrap">
											{#if dtype === "html" || dtype === "markdown"}{@html val}{:else}{val}{/if}
										</div></td
									>
								{/each}
							</tr>
						{/if}
					</tbody>
				</table>

				<!-- table body: absolutely positioned rows (standard tanstack virtual pattern) -->
				<div
					class="virtual-body"
					style="height: {total_size}px; position: relative; flex-shrink: 0; width: {measurement.total_header_width
						? `${measurement.total_header_width}px`
						: '100%'};"
				>
					{#each virtual_items as virtual_row (virtual_row.key)}
						{@const row = rows[virtual_row.index]}
						{@const row_idx = row?.original._index ?? virtual_row.index}
						{#if row}
							<div
								class="virtual-row"
								class:row-odd={virtual_row.index % 2 !== 0}
								data-index={virtual_row.index}
								style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtual_row.start}px);{selected_cells.some(
									([r]) => r === row_idx
								)
									? ' z-index: 3;'
									: ''}"
								use:measure_row={row}
							>
								{#if show_row_numbers}
									<div
										class="row-number-cell"
										data-row={row_idx}
										data-col="row-number"
										style="flex: 0 0 {measurement.row_num_width}px; width: {measurement.row_num_width}px;"
									>
										{row_idx + 1}
									</div>
								{/if}
								{#each row.getVisibleCells() as cell, ci (cell.id)}
									{@const col_idx =
										(cell.column.columnDef.meta as any)?.colIndex ?? 0}
									{@const is_sel = is_cell_in_selection(
										[row_idx, col_idx],
										selected_cells
									)}
									<DataCell
										value={cell.getValue() as CellValue}
										display_value={get_display_value(row_idx, col_idx)}
										datatype={get_dtype(col_idx)}
										{row_idx}
										{col_idx}
										col_style={measurement.get_col_style(ci)}
										cell_style={get_styling(row_idx, col_idx)}
										selection_classes={is_cell_selected(
											[row_idx, col_idx],
											selected_cells
										)}
										is_editing={!!(
											editing &&
											editing[0] === row_idx &&
											editing[1] === col_idx
										)}
										is_flash={copy_flash && is_sel}
										is_static={!editable ||
											!!(cell.column.columnDef.meta as any)?.isStatic}
										show_menu_button={editable &&
											!(cell.column.columnDef.meta as any)?.isStatic &&
											selected_cells.length === 1 &&
											selected_cells[0][0] === row_idx &&
											selected_cells[0][1] === col_idx}
										show_selection_buttons={selected_cells.length === 1 &&
											selected_cells[0][0] === row_idx &&
											selected_cells[0][1] === col_idx}
										is_first_column={ci === 0 && !show_row_numbers}
										{latex_delimiters}
										{line_breaks}
										{editable}
										{max_chars}
										{i18n}
										{components}
										{is_dragging}
										wrap_text={wrap}
										onmousedown={(e) => handle_cell_click(e, row_idx, col_idx)}
										ondblclick={(e) =>
											handle_cell_dblclick(e, row_idx, col_idx)}
										oncontextmenu={(e) => {
											const is_static_cell = !!(
												cell.column.columnDef.meta as any
											)?.isStatic;
											if (!editable || is_static_cell) return;
											e.preventDefault();
											toggle_cell_menu(e, row_idx, col_idx);
										}}
										onblur={handle_blur}
										on_menu_click={(e) => toggle_cell_menu(e, row_idx, col_idx)}
										on_select_column={(c) => {
											selected_cells = rows.map(
												(_, r) => [r, c] as CellCoordinate
											);
											selected = selected_cells[0];
										}}
										on_select_row={(r) => {
											selected_cells = resolved_headers.map(
												(_, c) => [r, c] as CellCoordinate
											);
											selected = selected_cells[0];
										}}
									/>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</Upload>

		{#if show_scroll_button}
			<button class="scroll-top-button" onclick={scroll_to_top}>&uarr;</button>
		{/if}
	</div>
</div>

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
		can_delete_rows={!active_header_menu && values.length > 1 && editable}
		can_delete_cols={values.length > 0 &&
			(values[0]?.length ?? 0) > 1 &&
			editable}
		{i18n}
		on_sort={active_header_menu
			? (direction) => {
					handle_sort(active_header_menu!.col, direction);
					active_header_menu = null;
				}
			: undefined}
		on_clear_sort={active_header_menu
			? () => {
					clear_sort();
					active_header_menu = null;
				}
			: undefined}
		sort_direction={active_header_menu
			? get_sort_info(active_header_menu.col).direction
			: null}
		sort_priority={active_header_menu
			? get_sort_info(active_header_menu.col).priority
			: null}
		on_filter={active_header_menu
			? (dtype, filter, fvalue) => {
					handle_filter(active_header_menu!.col, dtype, filter, fvalue);
					active_header_menu = null;
				}
			: undefined}
		on_clear_filter={active_header_menu
			? () => {
					clear_filter();
					active_header_menu = null;
				}
			: undefined}
		filter_active={active_header_menu
			? get_filter_active(active_header_menu.col)
			: null}
	/>
{/if}

{#if values.length === 0 && editable && row_count[1] === "dynamic"}
	<EmptyRowButton on_click={() => add_row()} />
{/if}

<style>
	.table-container {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		position: relative;
		max-width: 100%;
		overflow: hidden;
	}

	.table-container.fullscreen {
		padding: var(--size-4);
		height: 100%;
		box-sizing: border-box;
	}

	.table-container.fullscreen .table-wrap {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.table-container.fullscreen .table-wrap > :global(*) {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.table-container.fullscreen .virtual-table-viewport {
		max-height: none !important;
		flex: 1 1 auto;
		min-height: 0;
	}

	.table-wrap {
		position: relative;
		transition: 150ms;
		width: 100%;
	}

	/* Constrain Upload component wrapper */
	.table-wrap > :global(*) {
		max-width: 100%;
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

	/* Virtual scroll container */
	.virtual-table-viewport {
		display: flex;
		flex-direction: column;
		overflow: auto;
		position: relative;
		-webkit-overflow-scrolling: touch;
		min-width: 0;
		max-width: 100%;
		scrollbar-width: thin;
		scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
	}

	.virtual-table-viewport::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	.virtual-table-viewport::-webkit-scrollbar-thumb {
		background-color: rgba(128, 128, 128, 0.5);
		border-radius: 4px;
	}

	.virtual-table-viewport:hover {
		scrollbar-color: rgba(160, 160, 160, 0.7) transparent;
	}

	.virtual-table-viewport.disable-scroll {
		overflow: hidden !important;
	}

	/* Header table: auto-sizes columns by content, sticky */
	.header-table {
		width: 100%;
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-md);
		font-family: var(--font-mono);
		border-spacing: 0;
		border-collapse: separate;
		table-layout: auto;
		position: sticky;
		top: 0;
		z-index: 7;
		flex-shrink: 0;
	}

	/* Hidden sizing row — visibility:collapse hides the row but keeps column width contribution */
	.sizing-body tr {
		visibility: collapse;
	}

	.sizing-body td {
		padding: var(--size-2);
		border: none;
		white-space: nowrap;
	}

	/* Virtual body */
	.virtual-body {
		box-sizing: border-box;
	}

	.virtual-row {
		display: flex;
		align-items: stretch;
		background: var(--table-odd-background-fill);

		text-align: left;
		font-size: var(--input-text-size);
		line-height: var(--line-md);
		font-family: var(--font-mono);
		color: var(--body-text-color);
		min-height: var(--size-9);
	}

	.virtual-row:last-child {
		border-bottom: none;
	}

	.virtual-row.row-odd {
		background: var(--table-even-background-fill);
	}

	.virtual-row:hover {
		background: var(--table-row-focus);
	}

	/* Cell content wrapper (used in sizing-body) */
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

	/* Row number cells */
	.row-number-header {
		text-align: center;
		padding: var(--size-1);
		min-width: var(--size-12);
		width: var(--size-12);
		font-weight: var(--weight-semibold);
		border-right: 1px solid var(--border-color-primary);
		background: var(--table-even-background-fill) !important;
	}

	.row-number-cell {
		text-align: center;
		padding: var(--size-1);
		min-width: var(--size-12);
		width: var(--size-12);
		flex-shrink: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: var(--weight-semibold);
		border-right: 1px solid var(--border-color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-wrap {
		white-space: nowrap;
	}

	div:not(.no-wrap) :global(td) {
		overflow-wrap: anywhere;
	}

	div.no-wrap :global(td) {
		overflow-x: hidden;
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
</style>
