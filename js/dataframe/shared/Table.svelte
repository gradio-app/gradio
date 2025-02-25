<script lang="ts" context="module">
	import { type SortDirection, create_dataframe_context } from "./context";
	import { create_keyboard_context } from "./context/keyboard_context";
	import { create_selection_context } from "./context/selection_context";
</script>

<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick, onMount } from "svelte";
	import { dequal } from "dequal/lite";
	import { Upload } from "@gradio/upload";

	import EditableCell from "./EditableCell.svelte";
	import type { SelectData } from "@gradio/utils";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { type Client } from "@gradio/client";
	import VirtualTable from "./VirtualTable.svelte";
	import type { Headers, DataframeValue, Datatype } from "./utils";
	import CellMenu from "./CellMenu.svelte";
	import Toolbar from "./Toolbar.svelte";
	import SortIcon from "./icons/SortIcon.svelte";
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

	let actual_pinned_columns = 0;
	$: actual_pinned_columns =
		pinned_columns && data?.[0]?.length
			? Math.min(pinned_columns, data[0].length)
			: 0;

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

	// $: row_order = $df_state.sort_state.row_order;

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

	$: sort_data(
		data,
		display_value,
		styling,
		$df_state.sort_state.sort_by,
		$df_state.sort_state.sort_direction
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
		selected_cells
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

	async function handle_copy(): Promise<void> {
		await copy_table_data(data, null);
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
				data: data.map((row) => row.map((cell) => cell.value)),
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
				on_copy={handle_copy}
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
							aria-sort={df_actions.get_sort_status(value, headers) === "none"
								? "none"
								: df_actions.get_sort_status(value, headers) === "asc"
									? "ascending"
									: "descending"}
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
									{#if header_edit !== i}
										<div class="sort-buttons">
											<SortIcon
												direction={$df_state.sort_state.sort_by === i
													? $df_state.sort_state.sort_direction
													: null}
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
											bind:value={_headers[i].value}
											bind:el={els[id].input}
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
								aria-sort={df_actions.get_sort_status(value, headers) === "none"
									? "none"
									: df_actions.get_sort_status(value, headers) === "asc"
										? "ascending"
										: "descending"}
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
							>
								<div class="cell-wrap">
									<div class="header-content">
										{#if header_edit !== i}
											<div class="sort-buttons">
												<SortIcon
													direction={$df_state.sort_state.sort_by === i
														? $df_state.sort_state.sort_direction
														: null}
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
												bind:value={_headers[i].value}
												bind:el={els[id].input}
												{latex_delimiters}
												{line_breaks}
												edit={header_edit === i}
												header
												{root}
												{editable}
												{i18n}
											/>
										</button>
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
								class={is_cell_selected([index, j], selected_cells || [])}
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
										{components}
										{i18n}
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
	@import "./styles/cells.css";
	@import "./styles/selection.css";
	@import "./styles/misc.css";
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

	tr th {
		background: var(--table-even-background-fill);
	}
</style>
