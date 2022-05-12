<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { dsvFormat } from "d3-dsv";
	import { dequal } from "dequal/lite";

	import { Upload } from "@gradio/upload";
	import EditableCell from "./EditableCell.svelte";

	export let headers: Array<string> = [];
	export let values: Array<Array<string | number>> = [[]];
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];

	export let editable = true;

	const dispatch = createEventDispatcher<{ change: typeof values }>();

	let editing: boolean | string = false;
	let selected: boolean | string = false;
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
				.map((v, i) => `${i + _h.length}`);
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
				return { id: _id, value: h || "" };
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
			.map((x, i) =>
				Array(col_count[1] === "fixed" ? col_count[0] : _values[0].length)
					.fill(0)
					.map((n, j) => {
						const id = `${i}-${j}`;
						els[id] = { input: null, cell: null };
						return { value: _values?.[i]?.[j] || "", id };
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
		data = process_data(values);
		old_val = values;

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
		dispatch(
			"change",
			data.map((r) => r.map(({ value }) => value))
		);

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

	let header_edit: string | boolean;

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
				event.preventDefault();
				selected = header_edit;
				header_edit = false;

				break;
			case "Enter":
				event.preventDefault();
				selected = header_edit;
				header_edit = false;
		}
	}

	function add_row(index?: number) {
		if (row_count[1] !== "dynamic") return;
		data.splice(
			index ? index + 1 : data.length,
			0,
			Array(col_count[0])
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
				header_edit = false;
			}
		}

		if (typeof header_edit === "string" && els[header_edit]) {
			if (
				els[header_edit].cell !== event.target &&
				!els[header_edit].cell?.contains(event.target as Node | null)
			) {
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

<svelte:window on:click={handle_click_outside} />

<div
	class="scroll-hide whitespace-nowrap overflow-hidden rounded-lg relative border transition-colors overflow-x-scroll"
	class:border-green-400={dragging}
>
	<Upload
		flex={false}
		center={false}
		boundedheight={false}
		click={false}
		on:load={(e) => blob_to_string(data_uri_to_blob(e.detail.data))}
		bind:dragging
	>
		<table
			class="table-auto font-mono w-full text-gray-900 text-sm transition-opacity overflow-hidden "
			class:opacity-40={dragging}
		>
			<thead class="sticky top-0 left-0 right-0 bg-white shadow-sm z-10">
				<tr
					class="border-b  dark:border-gray-700 divide-x dark:divide-gray-700 text-left"
				>
					{#each _headers as { value, id }, i (id)}
						<th
							bind:this={els[id].cell}
							class="p-0 relative focus-within:ring-1 ring-orange-500 ring-inset outline-none "
							class:bg-orange-50={header_edit === id}
							class:dark:bg-transparent={header_edit === id}
							class:rounded-tl-lg={i === 0}
							class:rounded-tr-lg={i === _headers.length - 1}
							aria-sort={get_sort_status(value, sort_by, sort_direction)}
						>
							<div class="min-h-[2.3rem] flex outline-none">
								<EditableCell
									{value}
									bind:el={els[id].input}
									edit={header_edit === id}
									on:keydown={end_header_edit}
									on:dblclick={() => edit_header(id)}
									header
								/>

								<div
									class="flex flex-none items-center justify-center p-2 cursor-pointer  leading-snug transform transition-all {sort_by !==
									i
										? 'text-gray-200 hover:text-gray-500'
										: 'text-orange-500'} {sort_by === i &&
									sort_direction === 'des'
										? '-scale-y-[1]'
										: ''}"
									class:text-gray-200={sort_by !== i}
									on:click={() => handle_sort(i)}
								>
									<svg
										width="1em"
										height="1em"
										class="fill-current text-[10px]"
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

			<tbody class="overflow-y-scroll">
				{#each data as row, i (row)}
					<tr
						class="group border-b dark:border-gray-700 last:border-none divide-x dark:divide-gray-700 space-x-4 odd:bg-gray-50 dark:odd:bg-gray-900 group focus:bg-gradient-to-b focus:from-blue-100 dark:focus:from-blue-900 focus:to-blue-50 dark:focus:to-gray-900 focus:odd:bg-white"
					>
						{#each row as { value, id }, j (id)}
							<td
								tabindex="0"
								bind:this={els[id].cell}
								on:click={() => handle_cell_click(id)}
								on:dblclick={() => start_edit(id)}
								on:keydown={(e) => handle_keydown(e, i, j, id)}
								class=" outline-none focus-within:ring-1 ring-orange-500 ring-inset focus-within:bg-orange-50 dark:focus-within:bg-gray-800 group-last:first:rounded-bl-lg group-last:last:rounded-br-lg relative"
							>
								<div
									class:border-transparent={selected !== id}
									class="min-h-[2.3rem] h-full  outline-none flex items-center"
								>
									<EditableCell
										bind:value
										bind:el={els[id].input}
										edit={editing === id}
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
	<div class="flex justify-end space-x-1 pt-2 text-gray-800">
		{#if row_count[1] === "dynamic"}
			<button class="!flex-none gr-button group" on:click={() => add_row()}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					aria-hidden="true"
					role="img"
					class="mr-1 group-hover:text-orange-500"
					width="1em"
					height="1em"
					preserveAspectRatio="xMidYMid meet"
					viewBox="0 0 32 32"
					><path
						fill="currentColor"
						d="M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z"
					/></svg
				>New row</button
			>
		{/if}
		{#if col_count[1] === "dynamic"}
			<button class="!flex-none gr-button group" on:click={add_col}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					aria-hidden="true"
					role="img"
					class="mr-1 group-hover:text-orange-500"
					width="1em"
					height="1em"
					preserveAspectRatio="xMidYMid meet"
					viewBox="0 0 32 32"
					><path
						fill="currentColor"
						d="m18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10L18 6z"
					/></svg
				>
				New column</button
			>{/if}
	</div>
{/if}
