<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { dsvFormat } from "d3-dsv";
	import { dequal } from "dequal/lite";

	import { Upload } from "@gradio/upload";
	import { Button } from "@gradio/button";
	import EditableCell from "./EditableCell.svelte";
	import type { SelectData } from "@gradio/utils";

	type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";

	export let datatype: Datatype | Array<Datatype>;
	export let label: string | null = null;
	export let headers: Array<string> = [];
	export let values:
		| Array<Array<string | number>>
		| { data: Array<Array<string | number>>; headers: Array<string> } = [[]];
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];

	export let editable = true;
	export let wrap: boolean = false;

	let selected: false | string = false;

	$: {
		if (values && !Array.isArray(values)) {
			headers = values.headers;
			values =
				values.data.length === 0
					? [Array(headers.length).fill("")]
					: values.data;
			selected = false;
		} else if (values === null) {
			values = [Array(headers.length).fill("")];
			selected = false;
		}
	}

	const dispatch = createEventDispatcher<{
		change: { data: Array<Array<string | number>>; headers: Array<string> };
		select: SelectData;
	}>();

	let editing: false | string = false;

	const get_data_at = (row: number, col: number) => data[row][col].value;
	$: {
		if (selected !== false) {
			const loc = selected.split("-");
			const row = parseInt(loc[0]);
			const col = parseInt(loc[1]);
			if (!isNaN(row) && !isNaN(col)) {
				dispatch("select", { index: [row, col], value: get_data_at(row, col) });
			}
		}
	}
	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	> = {};

	type Headers = Array<{ value: string; id: string }>;

	function make_headers(_head: Array<string>): Headers {
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
					const _id = `h-${i}`;
					els[_id] = { cell: null, input: null };
					return { id: _id, value: JSON.stringify(i + 1) };
				});
		} else {
			return _h.map((h, i) => {
				const _id = `h-${i}`;
				els[_id] = { cell: null, input: null };
				return { id: _id, value: h ?? "" };
			});
		}
	}

	function process_data(_values: Array<Array<string | number>>) {
		const data_row_length = _values.length > 0 ? _values.length : row_count[0];

		return Array(
			row_count[1] === "fixed"
				? row_count[0]
				: data_row_length < row_count[0]
				? row_count[0]
				: data_row_length
		)
			.fill(0)
			.map((_, i) =>
				Array(col_count[1] === "fixed" ? col_count[0] : _values[0].length)
					.fill(0)
					.map((_, j) => {
						const id = `${i}-${j}`;
						els[id] = { input: null, cell: null };
						return { value: _values?.[i]?.[j] ?? "", id };
					})
			);
	}

	let _headers = make_headers(headers);
	let old_headers: Array<string> | undefined;

	$: {
		if (!dequal(headers, old_headers)) {
			_headers = make_headers(headers);

			old_headers = headers;
			refresh_focus();
		}
	}
	$: if (!dequal(values, old_val)) {
		data = process_data(values as Array<Array<string | number>>);
		old_val = values as Array<Array<string | number>>;

		refresh_focus();
	}

	async function refresh_focus() {
		if (typeof editing === "string") {
			await tick();
			els[editing as string]?.input?.focus();
		} else if (typeof selected === "string") {
			await tick();
			els[selected as string]?.input?.focus();
		}
	}

	let data: Array<Array<{ id: string; value: string | number }>> = [[]];

	let old_val: undefined | Array<Array<string | number>> = undefined;

	$: _headers &&
		dispatch("change", {
			data: data.map((r) => r.map(({ value }) => value)),
			headers: _headers.map((h) => h.value)
		});

	function get_sort_status(
		name: string,
		sort: number,
		direction?: SortDirection
	) {
		if (!sort) return "none";
		if (headers[sort] === name) {
			if (direction === "asc") return "ascending";
			if (direction === "des") return "descending";
		}
	}

	function get_current_indices(id: string) {
		return data.reduce(
			(acc, arr, i) => {
				const j = arr.reduce((acc, data, j) => (id === data.id ? j : acc), -1);

				return j === -1 ? acc : [i, j];
			},
			[-1, -1]
		);
	}

	async function start_edit(id: string, clear?: boolean) {
		if (!editable || editing === id) return;

		if (clear) {
			const [i, j] = get_current_indices(id);

			data[i][j].value = "";
		}
		editing = id;
		await tick();
		const { input } = els[id];
		input?.focus();
	}

	async function handle_keydown(
		event: KeyboardEvent,
		i: number,
		j: number,
		id: string
	) {
		let is_data;

		switch (event.key) {
			case "ArrowRight":
				if (editing) break;
				event.preventDefault();
				is_data = data[i][j + 1];
				selected = is_data ? is_data.id : selected;
				break;
			case "ArrowLeft":
				if (editing) break;
				event.preventDefault();
				is_data = data[i][j - 1];
				selected = is_data ? is_data.id : selected;
				break;
			case "ArrowDown":
				if (editing) break;
				event.preventDefault();
				is_data = data[i + 1];
				selected = is_data ? is_data[j].id : selected;
				break;
			case "ArrowUp":
				if (editing) break;
				event.preventDefault();
				is_data = data[i - 1];
				selected = is_data ? is_data[j].id : selected;
				break;
			case "Escape":
				if (!editable) break;
				event.preventDefault();
				selected = editing;
				editing = false;
				break;
			case "Enter":
				if (!editable) break;
				event.preventDefault();

				if (event.shiftKey) {
					add_row(i);
					await tick();
					const [pos] = get_current_indices(id);
					selected = data[pos + 1][j].id;
				} else {
					if (editing === id) {
						editing = false;
					} else {
						start_edit(id);
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
				let _selected = is_data_x || is_data_y;
				if (_selected) {
					event.preventDefault();
					selected = _selected ? _selected.id : selected;
				}
				editing = false;

				break;
			default:
				if (
					(!editing || (editing && editing !== id)) &&
					event.key.length === 1
				) {
					start_edit(id, true);
				}

				break;
		}
	}

	async function handle_cell_click(id: string) {
		if (editing === id) return;
		if (selected === id) return;
		editing = false;
		selected = id;
	}

	async function set_focus(id: string | boolean, type: "edit" | "select") {
		if (type === "edit" && typeof id == "string") {
			await tick();
			els[id].input?.focus();
		}

		if (
			type === "edit" &&
			typeof id == "boolean" &&
			typeof selected === "string"
		) {
			let cell = els[selected]?.cell;
			await tick();
			cell?.focus();
		}

		if (type === "select" && typeof id == "string") {
			const { cell } = els[id];
			// cell?.setAttribute("tabindex", "0");
			await tick();
			cell?.focus();
		}
	}

	$: set_focus(editing, "edit");
	$: set_focus(selected, "select");

	type SortDirection = "asc" | "des";
	let sort_direction: SortDirection;
	let sort_by: number;

	function sort(col: number, dir: SortDirection) {
		if (dir === "asc") {
			data = data.sort((a, b) => (a[col].value < b[col].value ? -1 : 1));
		} else if (dir === "des") {
			data = data.sort((a, b) => (a[col].value > b[col].value ? -1 : 1));
		}
	}

	function handle_sort(col: number) {
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

		sort(col, sort_direction);
	}

	let header_edit: string | false;

	function update_headers_data() {
		if (typeof selected === "string") {
			const new_header = els[selected].input?.value;
			if (_headers.find((i) => i.id === selected)) {
				let obj = _headers.find((i) => i.id === selected);
				if (new_header) obj!["value"] = new_header;
			} else {
				if (new_header) _headers.push({ id: selected, value: new_header });
			}
		}
	}

	async function edit_header(_id: string, select?: boolean) {
		if (!editable || col_count[1] !== "dynamic" || editing === _id) return;
		header_edit = _id;
		await tick();
		els[_id].input?.focus();
		if (select) els[_id].input?.select();
	}

	function end_header_edit(event: KeyboardEvent) {
		if (!editable) return;

		switch (event.key) {
			case "Escape":
			case "Enter":
			case "Tab":
				event.preventDefault();
				selected = header_edit;
				header_edit = false;
				update_headers_data();
				break;
		}
	}

	function add_row(index?: number) {
		if (row_count[1] !== "dynamic") return;
		data.splice(
			index ? index + 1 : data.length,
			0,
			Array(data[0].length)
				.fill(0)
				.map((_, i) => {
					const _id = `${data.length}-${i}`;
					els[_id] = { cell: null, input: null };
					return { id: _id, value: "" };
				})
		);

		data = data;
	}

	async function add_col() {
		if (col_count[1] !== "dynamic") return;
		for (let i = 0; i < data.length; i++) {
			const _id = `${i}-${data[i].length}`;
			els[_id] = { cell: null, input: null };
			data[i].push({ id: _id, value: "" });
		}

		const _id = `h-${_headers.length}`;
		els[_id] = { cell: null, input: null };
		_headers.push({ id: _id, value: `Header ${_headers.length + 1}` });

		data = data;
		_headers = _headers;

		await tick();

		edit_header(_id, true);
	}

	function handle_click_outside(event: Event) {
		if (typeof editing === "string" && els[editing]) {
			if (
				els[editing].cell !== event.target &&
				!els[editing].cell?.contains(event?.target as Node | null)
			) {
				editing = false;
			}
		}

		if (typeof header_edit === "string" && els[header_edit]) {
			if (
				els[header_edit].cell !== event.target &&
				!els[header_edit].cell?.contains(event.target as Node | null)
			) {
				selected = header_edit;
				header_edit = false;
				update_headers_data();
				header_edit = false;
			}
		}
	}

	function guess_delimitaor(text: string, possibleDelimiters: Array<string>) {
		return possibleDelimiters.filter(weedOut);

		function weedOut(delimiter: string) {
			var cache = -1;
			return text.split("\n").every(checkLength);

			function checkLength(line: string) {
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

	function data_uri_to_blob(data_uri: string) {
		const byte_str = atob(data_uri.split(",")[1]);
		const mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		const ab = new ArrayBuffer(byte_str.length);
		const ia = new Uint8Array(ab);

		for (let i = 0; i < byte_str.length; i++) {
			ia[i] = byte_str.charCodeAt(i);
		}

		return new Blob([ab], { type: mime_str });
	}

	function blob_to_string(blob: Blob) {
		const reader = new FileReader();

		function handle_read(e: ProgressEvent<FileReader>) {
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
</script>

<svelte:window
	on:click={handle_click_outside}
	on:touchstart={handle_click_outside}
/>

<div class:label={label && label.length !== 0}>
	{#if label && label.length !== 0}
		<p>
			{label}
		</p>
	{/if}
	<div class="table-wrap scroll-hide" class:dragging class:no-wrap={!wrap}>
		<Upload
			flex={false}
			center={false}
			boundedheight={false}
			disable_click={true}
			on:load={(e) => blob_to_string(data_uri_to_blob(e.detail.data))}
			bind:dragging
		>
			<table class:dragging>
				{#if label && label.length !== 0}
					<caption class="sr-only">{label}</caption>
				{/if}
				<thead>
					<tr>
						{#each _headers as { value, id }, i (id)}
							<th
								bind:this={els[id].cell}
								class:editing={header_edit === id}
								aria-sort={get_sort_status(value, sort_by, sort_direction)}
							>
								<div class="cell-wrap">
									<EditableCell
										{value}
										bind:el={els[id].input}
										edit={header_edit === id}
										on:keydown={end_header_edit}
										on:dblclick={() => edit_header(id)}
										header
									/>

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
				</thead>

				<tbody>
					{#each data as row, i (row)}
						<tr>
							{#each row as { value, id }, j (id)}
								<td
									tabindex="0"
									bind:this={els[id].cell}
									on:touchstart={() => start_edit(id)}
									on:click={() => handle_cell_click(id)}
									on:dblclick={() => start_edit(id)}
									on:keydown={(e) => handle_keydown(e, i, j, id)}
								>
									<div
										class:border-transparent={selected !== id}
										class="cell-wrap"
									>
										<EditableCell
											bind:value
											bind:el={els[id].input}
											edit={editing === id}
											datatype={Array.isArray(datatype)
												? datatype[j]
												: datatype}
										/>
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</Upload>
	</div>
	{#if editable}
		<div class="controls-wrap">
			{#if row_count[1] === "dynamic"}
				<span class="button-wrap">
					<Button variant="secondary" size="sm" on:click={() => add_row()}>
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
						New row
					</Button>
				</span>
			{/if}
			{#if col_count[1] === "dynamic"}
				<span class="button-wrap">
					<Button variant="secondary" size="sm" on:click={add_col}>
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
						New column
					</Button>
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
	.label {
		margin-top: var(--size-6);
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
		overflow-x: scroll;
		overflow-y: hidden;
	}

	.dragging {
		border-color: var(--color-accent);
	}

	.no-wrap {
		white-space: nowrap;
	}

	table {
		transition: 150ms;
		width: var(--size-full);
		table-layout: auto;
		overflow: hidden;
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-md);
		font-family: var(--font-mono);
	}

	table.dragging {
		opacity: 0.4;
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

	th:focus-within,
	td:focus-within {
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

	tbody {
		overflow-y: scroll;
	}

	tbody > tr:last-child {
		border: none;
	}

	tbody > tr:nth-child(even) {
		background: var(--table-even-background-fill);
	}

	tbody > tr:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}

	tbody > tr:nth-child(odd):focus {
		background: var(--background-fill-primary);
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
</style>
