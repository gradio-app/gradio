<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";

	export let headers: Array<string> = [];
	export let values: Array<Array<string | number>> = [[]];

	export let style: string = "";

	export let editable = true;

	const dispatch = createEventDispatcher<{ change: typeof values }>();

	let editing: boolean | string = false;
	let selected: boolean | string = false;
	let els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	> = {};

	type Headers = Array<{ value: string; id: string }>;

	function make_headers(_h: Array<string>): Headers {
		if (!_h || _h.length === 0) {
			return values[0].map((_, i) => {
				const _id = `h-${i}`;
				els[_id] = { cell: null, input: null };
				return { id: _id, value: JSON.stringify(i + 1) };
			});
		} else {
			return _h.map((h, i) => {
				const _id = `h-${i}`;
				els[_id] = { cell: null, input: null };
				return { id: _id, value: h };
			});
		}
	}

	function process_data(_values: Array<Array<string | number>>) {
		return (
			_values.map((x, i) =>
				x.map((n, j) => {
					const id = `${i}-${j}`;
					els[id] = { input: null, cell: null };
					return { value: n, id };
				})
			) || [
				Array(headers.length)
					.fill(0)

					.map((_, j) => {
						const id = `0-${j}`;
						els[id] = { input: null, cell: null };

						return { value: "", id: `0-${j}` };
					})
			]
		);
	}

	let _headers = make_headers(headers);
	let old_headers: Array<string> | undefined;
	$: {
		if (!is_equal(headers, old_headers)) {
			_headers = make_headers(headers);
			old_headers = headers;
			refresh_focus();
		}
	}

	$: if (!is_equal(values, old_val)) {
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

	function is_equal(arr: Array<any>, arr2: Array<any> | undefined) {
		if (!arr2) return false;
		return arr.every((_arr, i) => {
			if (Array.isArray(_arr)) {
				return _arr.every((item, j) => {
					return item === arr2?.[i]?.[j];
				});
			} else {
				return _arr === arr2?.[i];
			}
		});
	}

	$: dispatch(
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

	async function start_edit(id: string) {
		if (!editable) return;
		editing = id;
		await tick();
		const { input } = els[id];
		input?.focus();
	}

	function handle_keydown(
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
				editing = false;
				break;
			case "Enter":
				if (!editable) break;
				event.preventDefault();
				if (editing === id) {
					editing = false;
				} else {
					editing = id;
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
			default:
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
		if (type === "edit" && typeof id == "number") {
			await tick();
			els[id].input?.focus();
		}

		if (
			type === "edit" &&
			typeof id == "boolean" &&
			typeof selected === "number"
		) {
			let cell = els[selected]?.cell;
			await tick();
			cell?.focus();
		}

		if (type === "select" && typeof id == "number") {
			const { cell } = els[id];
			cell?.setAttribute("tabindex", "0");
			await tick();
			els[id].cell?.focus();
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
		if (!editable) return;
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
				header_edit = false;
				break;
			case "Enter":
				event.preventDefault();
				header_edit = false;
		}
	}

	function add_row() {
		data.push(
			headers.map((_, i) => {
				const _id = `${data.length}-${i}`;
				els[_id] = { cell: null, input: null };
				return { id: _id, value: "" };
			})
		);
		data = data;
	}

	async function add_col() {
		for (let i = 0; i < data.length; i++) {
			const _id = `${i}-${data[i].length}`;
			els[_id] = { cell: null, input: null };
			data[i].push({ id: _id, value: "" });
		}

		const _id = `h-${headers.length}`;
		els[_id] = { cell: null, input: null };
		_headers.push({ id: _id, value: `Header ${_headers.length + 1}` });

		data = data;
		_headers = _headers;

		await tick();

		edit_header(_id, true);
	}

	const double_click = (
		node: HTMLElement,
		{ click, dblclick }: { click: Function; dblclick: Function }
	) => {
		let timer: NodeJS.Timeout | undefined;

		function handler(event: MouseEvent) {
			if (timer) {
				clearTimeout(timer);
				timer = undefined;
				dblclick(event);
			} else {
				timer = setTimeout(() => {
					click(event);
					timer = undefined;
				}, 250);
			}
		}

		node.addEventListener("click", handler);

		return {
			destroy: () => node.removeEventListener("click", handler)
		};
	};
</script>

<div class="overflow-hidden rounded-lg relative border">
	<table class="table-auto font-mono w-full text-gray-900 text-sm">
		<thead class="sticky top-0 left-0 right-0 bg-white shadow-sm z-10">
			<tr class="border-b divide-x dark:divide-gray-800 text-left">
				{#each _headers as { value, id }, i (id)}
					<th class="p-0 relative">
						<div
							class="flex outline-none focus-within:ring-1 ring-orange-500 focus-within:bg-orange-50 ring-inset {i ===
							0
								? 'rounded-tl-lg'
								: i === _headers.length - 1
								? 'rounded-tr-lg'
								: ''}"
						>
							<div
								class="py-2 pl-2 flex-1 outline-none"
								contenteditable={editable}
								on:input={(e) => (value = e.target.innerText)}
							>
								{value}
							</div>
							<div
								class="flex items-center justify-center p-2 cursor-pointer !visible leading-snug transform transition-all {sort_by !==
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

		<tbody class="overflow-scroll">
			{#each data as row, i (row)}
				<tr
					class="group border-b last:border-none divide-x dark:divide-gray-800 space-x-4 odd:bg-gray-50 dark:odd:bg-gray-900 group focus:bg-gradient-to-b focus:from-blue-100 dark:focus:from-blue-900 focus:to-blue-50 dark:focus:to-gray-900 focus:odd:bg-white"
				>
					{#each row as { value, id }, j (id)}
						<td
							class="p-2 outline-none focus-within:ring-1 ring-orange-500 ring-inset focus-within:bg-orange-50 group-last:first:rounded-bl-lg group-last:last:rounded-br-lg"
							contenteditable={editable}
							on:input={(e) => (value = e.target.innerText)}
						>
							<div
								class:border-transparent={selected !== id}
								class="min-h-[3.3rem] px-5 py-3  border-[0.125rem] {selected ===
								id
									? 'border-gray-600 dark:border-gray-200'
									: ''}"
							>
								{#if editing === id}
									<input
										class="outline-none absolute p-0 w-3/4"
										tabindex="-1"
										bind:value
										bind:this={els[id].input}
										on:blur={({ currentTarget }) =>
											currentTarget.setAttribute("tabindex", "-1")}
									/>
								{/if}
								<span
									class="cursor-default w-full"
									class:opacity-0={editing === id}
									tabindex="-1"
									role="button"
								>
									{value ?? ""}
								</span>
							</div>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
{#if editable}
	<div class="flex justify-end space-x-1 pt-2 text-gray-800">
		<button class="!flex-none gr-button group" on:click={add_row}
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
		>
	</div>
{/if}
