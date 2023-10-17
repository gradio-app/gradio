<script lang="ts">
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { dsvFormat } from "d3-dsv";
	import { dequal } from "dequal/lite";
	import { copy } from "@gradio/utils";
	import { Upload } from "@gradio/upload";
	import { BaseButton } from "@gradio/button";
	import EditableCell from "./EditableCell.svelte";
	import type { SelectData } from "@gradio/utils";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import VirtualTable from "./VirtualTable.svelte";
	import type {
		Headers,
		HeadersWithIDs,
		Data,
		Metadata,
		Datatype
	} from "./utils";

	export let datatype: Datatype | Datatype[];
	export let label: string | null = null;
	export let headers: Headers = [];
	let values: (string | number)[][];
	export let value: { data: Data; headers: Headers; metadata: Metadata } | null;
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

	export let height = 500;
	export let line_breaks = true;
	export let column_widths: string[] = [];

	let selected: false | [number, number] = false;
	let display_value: string[][] | null = value?.metadata?.display_value ?? null;
	let styling: string[][] | null = value?.metadata?.styling ?? null;

	$: {
		if (value) {
			headers = value.headers;
			values = value.data;
			display_value = value?.metadata?.display_value ?? null;
			styling = value?.metadata?.styling ?? null;
		} else if (values === null) {
			values = [];
		}
	}

	const dispatch = createEventDispatcher<{
		change: {
			data: (string | number)[][];
			headers: string[];
			metadata: Metadata;
		};
		select: SelectData;
	}>();

	let editing: false | [number, number] = false;

	const get_data_at = (row: number, col: number): string | number =>
		data?.[row]?.[col]?.value;
	$: {
		if (selected !== false) {
			const [row, col] = selected;
			if (!isNaN(row) && !isNaN(col)) {
				dispatch("select", { index: [row, col], value: get_data_at(row, col) });
			}
		}
	}
	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	> = {};

	let data_binding: Record<string, (typeof data)[0][0]> = {};

	function make_id(): string {
		return Math.random().toString(36).substring(2, 15);
	}
	function make_headers(_head: Headers): HeadersWithIDs {
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
		return Array(
			row_count[1] === "fixed"
				? row_count[0]
				: data_row_length < row_count[0]
				? row_count[0]
				: data_row_length
		)
			.fill(0)
			.map((_, i) =>
				Array(
					col_count[1] === "fixed"
						? col_count[0]
						: data_row_length > 0
						? _values[0].length
						: headers.length
				)
					.fill(0)
					.map((_, j) => {
						const id = make_id();
						els[id] = els[id] || { input: null, cell: null };
						const obj = { value: _values?.[i]?.[j] ?? "", id };
						data_binding[id] = obj;
						return obj;
					})
			);
	}

	let _headers = make_headers(headers);
	let old_headers: string[] | undefined;

	$: {
		if (!dequal(headers, old_headers)) {
			trigger_headers();
		}
	}

	function trigger_headers(): void {
		_headers = make_headers(headers);

		old_headers = headers.slice();
	}
	$: if (!dequal(values, old_val)) {
		data = process_data(values as (string | number)[][]);
		old_val = values as (string | number)[][];
	}

	let data: { id: string; value: string | number }[][] = [[]];

	let old_val: undefined | (string | number)[][] = undefined;

	$: _headers &&
		dispatch("change", {
			data: data.map((r) => r.map(({ value }) => value)),
			headers: _headers.map((h) => h.value),
			metadata: editable
				? null
				: { display_value: display_value, styling: styling }
		});

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

	function get_current_indices(id: string): [number, number] {
		return data.reduce(
			(acc, arr, i) => {
				const j = arr.reduce(
					(_acc, _data, k) => (id === _data.id ? k : _acc),
					-1
				);

				return j === -1 ? acc : [i, j];
			},
			[-1, -1]
		);
	}

	async function start_edit(i: number, j: number): Promise<void> {
		if (!editable || dequal(editing, [i, j])) return;

		editing = [i, j];
	}

	function move_cursor(
		key: "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
		current_coords: [number, number]
	): void {
		const dir = {
			ArrowRight: [0, 1],
			ArrowLeft: [0, -1],
			ArrowDown: [1, 0],
			ArrowUp: [-1, 0]
		}[key];

		const i = current_coords[0] + dir[0];
		const j = current_coords[1] + dir[1];

		if (i < 0 && j <= 0) {
			selected_header = j;
			selected = false;
		} else {
			const is_data = data[i]?.[j];
			selected = is_data ? [i, j] : selected;
		}
	}

	let clear_on_focus = false;
	// eslint-disable-next-line complexity
	async function handle_keydown(event: KeyboardEvent): Promise<void> {
		if (selected_header !== false && header_edit === false) {
			switch (event.key) {
				case "ArrowDown":
					selected = [0, selected_header];
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
					break;
			}
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
				move_cursor(event.key, [i, j]);
				break;

			case "Escape":
				if (!editable) break;
				event.preventDefault();
				editing = false;
				break;
			case "Enter":
				if (!editable) break;
				event.preventDefault();

				if (event.shiftKey) {
					add_row(i);
					await tick();

					selected = [i + 1, j];
				} else {
					if (dequal(editing, [i, j])) {
						editing = false;
						await tick();
						selected = [i, j];
					} else {
						editing = [i, j];
					}
				}

				break;
			case "Backspace":
				if (!editable) break;
				if (!editing) {
					event.preventDefault();
					data[i][j].value = "";
				}
				break;
			case "Delete":
				if (!editable) break;
				if (!editing) {
					event.preventDefault();
					data[i][j].value = "";
				}
				break;
			case "Tab":
				let direction = event.shiftKey ? -1 : 1;

				let is_data_x = data[i][j + direction];
				let is_data_y =
					data?.[i + direction]?.[direction > 0 ? 0 : _headers.length - 1];

				if (is_data_x || is_data_y) {
					event.preventDefault();
					selected = is_data_x
						? [i, j + direction]
						: [i + direction, direction > 0 ? 0 : _headers.length - 1];
				}
				editing = false;

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

	async function handle_cell_click(i: number, j: number): Promise<void> {
		if (dequal(editing, [i, j])) return;
		header_edit = false;
		selected_header = false;
		editing = false;
		selected = [i, j];
		await tick();
		parent.focus();
	}

	type SortDirection = "asc" | "des";
	let sort_direction: SortDirection | undefined;
	let sort_by: number | undefined;

	function handle_sort(col: number): void {
		if (typeof sort_by !== "number" || sort_by !== col) {
			sort_direction = "asc";
			sort_by = col;
		} else {
			if (sort_direction === "asc") {
				sort_direction = "des";
			} else if (sort_direction === "des") {
				sort_direction = "asc";
			}
		}
	}

	let header_edit: number | false;

	let select_on_focus = false;
	let selected_header: number | false = false;
	async function edit_header(i: number, _select = false): Promise<void> {
		if (!editable || col_count[1] !== "dynamic" || header_edit === i) return;
		selected = false;
		selected_header = i;
		header_edit = i;
		select_on_focus = _select;
	}

	function end_header_edit(event: KeyboardEvent): void {
		if (!editable) return;

		switch (event.key) {
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
		if (data.length === 0) {
			values = [Array(headers.length).fill("")];
			return;
		}

		data.splice(
			index ? index + 1 : data.length,
			0,
			Array(data[0].length)
				.fill(0)
				.map((_, i) => {
					const _id = make_id();

					els[_id] = { cell: null, input: null };
					return { id: _id, value: "" };
				})
		);

		data = data;
		selected = [index ? index + 1 : data.length - 1, 0];
	}

	async function add_col(): Promise<void> {
		parent.focus();
		if (col_count[1] !== "dynamic") return;
		for (let i = 0; i < data.length; i++) {
			const _id = make_id();
			els[_id] = { cell: null, input: null };
			data[i].push({ id: _id, value: "" });
		}

		headers.push(`Header ${headers.length + 1}`);

		data = data;
		headers = headers;

		await tick();

		requestAnimationFrame(() => {
			edit_header(headers.length - 1, true);
			const new_w = parent.querySelectorAll("tbody")[1].offsetWidth;
			parent.querySelectorAll("table")[1].scrollTo({ left: new_w });
		});
	}

	function handle_click_outside(event: Event): void {
		event.stopImmediatePropagation();
		const [trigger] = event.composedPath() as HTMLElement[];
		if (parent.contains(trigger)) {
			return;
		}

		editing = false;
		header_edit = false;
		selected_header = false;
		selected = false;
	}

	function guess_delimitaor(
		text: string,
		possibleDelimiters: string[]
	): string[] {
		return possibleDelimiters.filter(weedOut);

		function weedOut(delimiter: string): boolean {
			var cache = -1;
			return text.split("\n").every(checkLength);

			function checkLength(line: string): boolean {
				if (!line) {
					return true;
				}

				var length = line.split(delimiter).length;
				if (cache < 0) {
					cache = length;
				}
				return cache === length && length > 1;
			}
		}
	}

	function data_uri_to_blob(data_uri: string): Blob {
		const byte_str = atob(data_uri.split(",")[1]);
		const mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		const ab = new ArrayBuffer(byte_str.length);
		const ia = new Uint8Array(ab);

		for (let i = 0; i < byte_str.length; i++) {
			ia[i] = byte_str.charCodeAt(i);
		}

		return new Blob([ab], { type: mime_str });
	}

	function blob_to_string(blob: Blob): void {
		const reader = new FileReader();

		function handle_read(e: ProgressEvent<FileReader>): void {
			if (!e?.target?.result || typeof e.target.result !== "string") return;

			const [delimiter] = guess_delimitaor(e.target.result, [",", "\t"]);

			const [head, ...rest] = dsvFormat(delimiter).parseRows(e.target.result);

			_headers = make_headers(
				col_count[1] === "fixed" ? head.slice(0, col_count[0]) : head
			);

			values = rest;
			reader.removeEventListener("loadend", handle_read);
		}

		reader.addEventListener("loadend", handle_read);

		reader.readAsText(blob);
	}

	let dragging = false;

	let t_width = 0;

	function get_max(
		_d: { value: any; id: string }[][]
	): { value: any; id: string }[] {
		let max = _d[0].slice();
		for (let i = 0; i < _d.length; i++) {
			for (let j = 0; j < _d[i].length; j++) {
				if (`${max[j].value}`.length < `${_d[i][j].value}`.length) {
					max[j] = _d[i][j];
				}
			}
		}

		return max;
	}

	$: max = get_max(data);

	$: cells[0] && set_cell_widths();
	let cells: HTMLTableCellElement[] = [];
	let parent: HTMLDivElement;
	let table: HTMLTableElement;

	function set_cell_widths(): void {
		const widths = cells.map((el, i) => {
			return el?.clientWidth || 0;
		});
		if (widths.length === 0) return;
		for (let i = 0; i < widths.length; i++) {
			parent.style.setProperty(
				`--cell-width-${i}`,
				`${widths[i] - scrollbar_width / widths.length}px`
			);
		}
	}

	let table_height: number = height;
	let scrollbar_width = 0;

	function sort_data(
		_data: typeof data,
		_display_value: string[][] | null,
		_styling: string[][] | null,
		col?: number,
		dir?: SortDirection
	): void {
		let id = null;
		//Checks if the selected cell is still in the data
		if (selected && selected[0] in data && selected[1] in data[selected[0]]) {
			id = data[selected[0]][selected[1]].id;
		}
		if (typeof col !== "number" || !dir) {
			return;
		}
		const indices = [...Array(_data.length).keys()];

		if (dir === "asc") {
			indices.sort((i, j) =>
				_data[i][col].value < _data[j][col].value ? -1 : 1
			);
		} else if (dir === "des") {
			indices.sort((i, j) =>
				_data[i][col].value > _data[j][col].value ? -1 : 1
			);
		} else {
			return;
		}

		// sort all the data and metadata based on the values in the data
		const temp_data = [..._data];
		const temp_display_value = _display_value ? [..._display_value] : null;
		const temp_styling = _styling ? [..._styling] : null;
		indices.forEach((originalIndex, sortedIndex) => {
			_data[sortedIndex] = temp_data[originalIndex];
			if (_display_value && temp_display_value)
				_display_value[sortedIndex] = temp_display_value[originalIndex];
			if (_styling && temp_styling)
				_styling[sortedIndex] = temp_styling[originalIndex];
		});

		data = data;

		if (id) {
			const [i, j] = get_current_indices(id);
			selected = [i, j];
		}
	}

	$: sort_data(data, display_value, styling, sort_by, sort_direction);

	$: selected_index = !!selected && selected[0];

	let is_visible = false;
	onMount(() => {
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !is_visible) {
					set_cell_widths();
					data = data;
				}

				is_visible = entry.isIntersecting;
			});
		});

		observer.observe(parent);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:window
	on:click={handle_click_outside}
	on:touchstart={handle_click_outside}
	on:resize={() => set_cell_widths()}
/>

<div class:label={label && label.length !== 0} use:copy>
	{#if label && label.length !== 0}
		<p>
			{label}
		</p>
	{/if}
	<div
		bind:this={parent}
		class="table-wrap"
		class:dragging
		class:no-wrap={!wrap}
		style="height:{table_height}px"
		on:keydown={(e) => handle_keydown(e)}
		role="grid"
		tabindex="0"
	>
		<table
			bind:clientWidth={t_width}
			bind:this={table}
			class:fixed-layout={column_widths.length != 0}
		>
			{#if label && label.length !== 0}
				<caption class="sr-only">{label}</caption>
			{/if}
			<thead>
				<tr>
					{#each _headers as { value, id }, i (id)}
						<th
							class:editing={header_edit === i}
							aria-sort={get_sort_status(value, sort_by, sort_direction)}
							style:width={column_widths.length ? column_widths[i] : undefined}
						>
							<div class="cell-wrap">
								<EditableCell
									{value}
									{latex_delimiters}
									{line_breaks}
									header
									edit={false}
									el={null}
								/>

								<div
									class:sorted={sort_by === i}
									class:des={sort_by === i && sort_direction === "des"}
									class="sort-button {sort_direction} "
								>
									<svg
										width="1em"
										height="1em"
										viewBox="0 0 9 7"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M4.49999 0L8.3971 6.75H0.602875L4.49999 0Z" />
									</svg>
								</div>
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
								/>
							</div>
						</td>
					{/each}
				</tr>
			</tbody>
		</table>
		<Upload
			flex={false}
			center={false}
			boundedheight={false}
			disable_click={true}
			{root}
			on:load={(e) => blob_to_string(data_uri_to_blob(e.detail.data))}
			bind:dragging
		>
			<VirtualTable
				bind:items={data}
				table_width={t_width}
				max_height={height}
				bind:actual_height={table_height}
				bind:table_scrollbar_width={scrollbar_width}
				selected={selected_index}
			>
				{#if label && label.length !== 0}
					<caption class="sr-only">{label}</caption>
				{/if}
				<tr slot="thead">
					{#each _headers as { value, id }, i (id)}
						<th
							class:focus={header_edit === i || selected_header === i}
							aria-sort={get_sort_status(value, sort_by, sort_direction)}
							style="width: var(--cell-width-{i});"
						>
							<div class="cell-wrap">
								<EditableCell
									bind:value={_headers[i].value}
									bind:el={els[id].input}
									{latex_delimiters}
									{line_breaks}
									edit={header_edit === i}
									on:keydown={end_header_edit}
									on:dblclick={() => edit_header(i)}
									{select_on_focus}
									header
								/>

								<!-- TODO: fix -->
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions-->
								<div
									class:sorted={sort_by === i}
									class:des={sort_by === i && sort_direction === "des"}
									class="sort-button {sort_direction} "
									on:click={() => handle_sort(i)}
								>
									<svg
										width="1em"
										height="1em"
										viewBox="0 0 9 7"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M4.49999 0L8.3971 6.75H0.602875L4.49999 0Z" />
									</svg>
								</div>
							</div>
						</th>
					{/each}
				</tr>

				<tr slot="tbody" let:item let:index class:row_odd={index % 2 === 0}>
					{#each item as { value, id }, j (id)}
						<td
							tabindex="0"
							on:touchstart={() => start_edit(index, j)}
							on:click={() => handle_cell_click(index, j)}
							on:dblclick={() => start_edit(index, j)}
							style:width="var(--cell-width-{j})"
							style={styling?.[index]?.[j] || ""}
							class:focus={dequal(selected, [index, j])}
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
									on:blur={() => ((clear_on_focus = false), parent.focus())}
									{clear_on_focus}
								/>
							</div>
						</td>
					{/each}
				</tr>
			</VirtualTable>
		</Upload>
	</div>
	{#if editable}
		<div class="controls-wrap">
			{#if row_count[1] === "dynamic"}
				<span class="button-wrap">
					<BaseButton
						variant="secondary"
						size="sm"
						on:click={(e) => (e.stopPropagation(), add_row())}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							aria-hidden="true"
							role="img"
							width="1em"
							height="1em"
							preserveAspectRatio="xMidYMid meet"
							viewBox="0 0 32 32"
						>
							<path
								fill="currentColor"
								d="M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z"
							/>
						</svg>
						{i18n("dataframe.new_row")}
					</BaseButton>
				</span>
			{/if}
			{#if col_count[1] === "dynamic"}
				<span class="button-wrap">
					<BaseButton
						variant="secondary"
						size="sm"
						on:click={(e) => (e.stopPropagation(), add_col())}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							aria-hidden="true"
							role="img"
							width="1em"
							height="1em"
							preserveAspectRatio="xMidYMid meet"
							viewBox="0 0 32 32"
						>
							<path
								fill="currentColor"
								d="m18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10L18 6z"
							/>
						</svg>
						{i18n("dataframe.new_column")}
					</BaseButton>
				</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.button-wrap:hover svg {
		color: var(--color-accent);
	}

	.button-wrap svg {
		margin-right: var(--size-1);
		margin-left: -5px;
	}

	.label p {
		position: relative;
		z-index: var(--layer-4);
		margin-bottom: var(--size-2);
		color: var(--block-label-text-color);
		font-size: var(--block-label-text-size);
	}

	.table-wrap {
		position: relative;
		transition: 150ms;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
	}

	.table-wrap:focus-within {
		outline: none;
		background-color: none;
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
		left: 0;
		z-index: var(--layer-1);
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
	}

	th:last-child {
		border-top-right-radius: var(--table-radius);
	}

	th.focus,
	td.focus {
		--ring-color: var(--color-accent);
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

	th svg {
		fill: currentColor;
		font-size: 10px;
	}

	.sort-button {
		display: flex;
		flex: none;
		justify-content: center;
		align-items: center;
		transition: 150ms;
		cursor: pointer;
		padding: var(--size-2);
		color: var(--body-text-color-subdued);
		line-height: var(--text-sm);
	}

	.sort-button:hover {
		color: var(--body-text-color);
	}

	.des {
		transform: scaleY(-1);
	}

	.sort-button.sorted {
		color: var(--color-accent);
	}

	.editing {
		background: var(--table-editing);
	}

	.cell-wrap {
		display: flex;
		align-items: center;
		outline: none;
		height: var(--size-full);
		min-height: var(--size-9);
	}

	.controls-wrap {
		display: flex;
		justify-content: flex-end;
		padding-top: var(--size-2);
	}

	.controls-wrap > * + * {
		margin-left: var(--size-1);
	}

	.row_odd {
		background: var(--table-odd-background-fill);
	}

	.row_odd.focus {
		background: var(--background-fill-primary);
	}
</style>
