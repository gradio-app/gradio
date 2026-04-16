import { test, describe, afterEach, expect } from "vitest";
import {
	cleanup,
	render,
	fireEvent,
	waitFor,
	within
} from "@self/tootils/render";
import { tick } from "svelte";

import Dataframe from "./Index.svelte";

const default_props = {
	value: {
		data: [
			["Alice", "30", "Engineer"],
			["Bob", "25", "Designer"],
			["Carol", "35", "Manager"]
		],
		headers: ["Name", "Age", "Role"],
		metadata: null
	},
	col_count: [3, "fixed"] as [number, "fixed" | "dynamic"],
	row_count: [3, "fixed"] as [number, "fixed" | "dynamic"],
	editable: true,
	datatype: "str" as const,
	root: "",
	static_columns: [] as (string | number)[],
	latex_delimiters: [] as { left: string; right: string; display: boolean }[],
	line_breaks: true,
	wrap: false,
	column_widths: [] as string[],
	show_row_numbers: false,
	show_search: "none" as "none" | "search" | "filter",
	pinned_columns: 0,
	fullscreen: false,
	max_height: 500
};

function get_cell(container: HTMLElement, row: number, col: number) {
	return container.querySelector(
		`[data-row='${row}'][data-col='${col}']`
	) as HTMLElement | null;
}

function get_header_cells(container: HTMLElement) {
	return container.querySelectorAll("th.header-cell");
}

function get_rows(container: HTMLElement) {
	return container.querySelectorAll(".virtual-row");
}

function get_table_wrap(container: HTMLElement) {
	return container.querySelector(".table-wrap") as HTMLElement;
}

async function wait(ms = 50) {
	await new Promise((r) => setTimeout(r, ms));
	await tick();
	await tick();
}

describe("Dataframe rendering", () => {
	afterEach(() => cleanup());

	test("renders provided headers", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const headers = get_header_cells(container);
		const header_texts = Array.from(headers).map(
			(h) => h.textContent?.trim() ?? ""
		);
		expect(header_texts).toContain("Name");
		expect(header_texts).toContain("Age");
		expect(header_texts).toContain("Role");
	});

	test("renders provided cell values", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const alice_cell = get_cell(container, 0, 0);
		expect(alice_cell?.textContent).toContain("Alice");

		const bob_cell = get_cell(container, 1, 0);
		expect(bob_cell?.textContent).toContain("Bob");
	});

	test("renders correct number of rows", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const rows = get_rows(container);
		expect(rows.length).toBe(3);
	});

	test("renders label when show_label is true", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			label: "Test Table",
			show_label: true
		});
		await wait();

		expect(container.textContent).toContain("Test Table");
	});

	test("renders row numbers when show_row_numbers is true", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_row_numbers: true
		});
		await wait();

		const row_number_cells = container.querySelectorAll(".row-number-cell");
		expect(row_number_cells.length).toBeGreaterThan(0);
	});

	test("renders search input when show_search is 'search'", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_search: "search"
		});
		await wait();

		const search_input = container.querySelector(
			"input.search-input"
		) as HTMLInputElement;
		expect(search_input).not.toBeNull();
		expect(search_input.placeholder).toBe("Search...");
	});

	test("renders filter input when show_search is 'filter'", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_search: "filter"
		});
		await wait();

		const filter_input = container.querySelector(
			"input.search-input"
		) as HTMLInputElement;
		expect(filter_input).not.toBeNull();
		expect(filter_input.placeholder).toBe("Filter...");
	});
});

describe("Cell editing", () => {
	afterEach(() => cleanup());

	test("double-click enters edit mode (shows textarea)", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		);
		expect(textarea).not.toBeNull();
	});

	test("Escape key cancels edit", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "Escape" });
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		);
		expect(textarea).toBeNull();
	});

	test("non-editable dataframe prevents editing on double-click", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			interactive: false,
			editable: false
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		);
		expect(textarea).toBeNull();
	});

	test("static columns cannot be edited", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			static_columns: [0]
		});
		await wait();

		const static_cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(static_cell);
		await tick();
		await fireEvent.dblClick(static_cell);
		await wait();

		// static cell should not have an editable textarea
		const textarea = static_cell.querySelector("textarea");
		expect(textarea).toBeNull();
	});
});

describe("Cell selection", () => {
	afterEach(() => cleanup());

	test("click selects a cell", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 1, 1)!;
		await fireEvent.mouseDown(cell);
		await wait();

		// cell should have selection styling
		expect(cell.className).toContain("cell-selected");
	});

	test("arrow keys move selection", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "ArrowRight" });
		await wait();

		const next_cell = get_cell(container, 0, 1)!;
		expect(next_cell.className).toContain("cell-selected");
	});

	test("Tab moves to next cell", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "Tab" });
		await wait();

		const next_cell = get_cell(container, 0, 1)!;
		expect(next_cell.className).toContain("cell-selected");
	});

	test("shift+click selects a range", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const first_cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(first_cell);
		await wait();

		const last_cell = get_cell(container, 1, 1)!;
		await fireEvent.mouseDown(last_cell, { shiftKey: true });
		await wait();

		// all 4 cells in the 2x2 range should be selected
		expect(get_cell(container, 0, 0)!.className).toContain("cell-selected");
		expect(get_cell(container, 0, 1)!.className).toContain("cell-selected");
		expect(get_cell(container, 1, 0)!.className).toContain("cell-selected");
		expect(get_cell(container, 1, 1)!.className).toContain("cell-selected");
	});

	// Regression: pressing Ctrl between mousedown and mouseup must not call
	// handle_cell_click a second time via the click event.  If it did, the
	// Ctrl+click path would toggle the already-selected cell back off,
	// producing conflicting state updates that froze the interface.
	test("pressing Ctrl between mousedown and mouseup keeps cell selected", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;

		// mousedown (no ctrl) selects the cell
		await fireEvent.mouseDown(cell);
		await wait();
		expect(cell.className).toContain("cell-selected");

		// The browser fires a click event when the user releases the mouse button.
		// If the user pressed Ctrl before releasing, that click carries ctrlKey:true.
		// A second call to handle_cell_click with ctrlKey would toggle the cell
		// back off (deselect it).  Verify that the click event has no effect.
		await fireEvent.click(cell, { ctrlKey: true });
		await wait();

		expect(cell.className).toContain("cell-selected");
	});
});

describe("Header overflow", () => {
	let wrapper: HTMLDivElement;

	afterEach(async () => {
		cleanup();
		wrapper?.remove();
	});

	// Headers must expand to fit their text (no ellipsis truncation).
	// When headers are wider than the scroll container, later columns are
	// hidden by the container's overflow — not by cutting off the text.
	test("long headers are not truncated in the DOM and the 3rd header is hidden by scroll overflow", async () => {
		// Narrow container makes overflow predictable regardless of viewport size.
		wrapper = document.createElement("div");
		wrapper.style.width = "300px";
		document.body.appendChild(wrapper);

		// Capital W is one of the widest glyphs — 60 of them easily exceeds 300 px.
		const long_header = "W".repeat(60);

		const { getAllByRole } = await render(
			Dataframe,
			{
				...default_props,
				value: {
					data: [["a", "b", "c"]],
					headers: [long_header + " A", long_header + " B", long_header + " C"],
					metadata: null
				},
				col_count: [3, "fixed"] as [number, "fixed" | "dynamic"],
				row_count: [1, "fixed"] as [number, "fixed" | "dynamic"]
			},
			{ container: wrapper }
		);

		await wait();

		const headers = getAllByRole("columnheader");
		expect(headers).toHaveLength(3);

		// Full text must be present in the DOM — no in-cell truncation.
		expect(headers[2].textContent?.trim()).toContain(long_header + " C");

		// The 3rd header's left edge must be beyond the scroll container's right
		// edge, meaning it is completely outside the visible area.
		const viewport = wrapper.querySelector(
			".virtual-table-viewport"
		) as HTMLElement;
		const viewport_rect = viewport.getBoundingClientRect();
		const third_rect = headers[2].getBoundingClientRect();
		expect(third_rect.left).toBeGreaterThanOrEqual(viewport_rect.right);
	});
});

describe("Sorting", () => {
	afterEach(() => cleanup());

	test("sort ascending via header menu", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			col_count: [3, "dynamic"] as [number, "fixed" | "dynamic"]
		});
		await wait();

		// Click on the "Age" header — find by content containing "Age"
		const headers = get_header_cells(container);
		const age_header = Array.from(headers).find((h) =>
			h.textContent?.includes("Age")
		) as HTMLElement;
		expect(age_header).toBeTruthy();

		// Click the menu button on the header
		const menu_btn = age_header.querySelector(
			".cell-menu-button"
		) as HTMLElement;
		expect(menu_btn).toBeTruthy();
		await fireEvent.click(menu_btn);
		await wait();

		// Click "Sort ascending" in the menu
		const sort_asc_btn = Array.from(
			document.querySelectorAll('[role="menuitem"]')
		).find((el) => el.textContent?.includes("sort_ascending")) as HTMLElement;
		expect(sort_asc_btn).toBeTruthy();
		await fireEvent.click(sort_asc_btn);
		await wait();

		// After sorting by Age ascending, Bob (25) should be first visible row
		const first_row = container.querySelector(".virtual-row");
		const first_name_cell = first_row?.querySelector("[data-col='0']");
		expect(first_name_cell?.textContent).toContain("Bob");
	});
});

describe("Global search/filter", () => {
	afterEach(() => cleanup());

	test("search filters visible rows", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_search: "search"
		});
		await wait();

		const search_input = container.querySelector(
			"input.search-input"
		) as HTMLInputElement;
		expect(search_input).not.toBeNull();

		// Type a search query
		search_input.focus();
		await fireEvent.input(search_input, { target: { value: "Alice" } });
		await wait(100);

		const rows = get_rows(container);
		expect(rows.length).toBe(1);
		const first_cell = get_cell(container, 0, 0);
		expect(first_cell?.textContent).toContain("Alice");
	});

	test("clearing search restores all rows", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_search: "search"
		});
		await wait();

		const search_input = container.querySelector(
			"input.search-input"
		) as HTMLInputElement;

		// Search then clear
		await fireEvent.input(search_input, { target: { value: "Alice" } });
		await wait(100);
		expect(get_rows(container).length).toBe(1);

		await fireEvent.input(search_input, { target: { value: "" } });
		await wait(100);
		expect(get_rows(container).length).toBe(3);
	});

	test("filter mode shows apply button when query present", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			show_search: "filter"
		});
		await wait();

		const filter_input = container.querySelector(
			"input.search-input"
		) as HTMLInputElement;
		await fireEvent.input(filter_input, { target: { value: "Alice" } });
		await wait();

		const apply_btn = container.querySelector(
			"button[aria-label='Apply filter and update dataframe values']"
		);
		expect(apply_btn).not.toBeNull();
	});
});

describe("Add/remove rows and columns", () => {
	afterEach(() => cleanup());

	const dynamic_props = {
		...default_props,
		col_count: [3, "dynamic"] as [number, "fixed" | "dynamic"],
		row_count: [3, "dynamic"] as [number, "fixed" | "dynamic"]
	};

	test("add row button appends a new row", async () => {
		const { container } = await render(Dataframe, dynamic_props);
		await wait();

		const initial_rows = get_rows(container).length;

		// The empty row button should be present for dynamic row_count
		const add_btn = container.querySelector(".empty-row-button") as HTMLElement;
		if (add_btn) {
			await fireEvent.click(add_btn);
			await wait();

			expect(get_rows(container).length).toBe(initial_rows + 1);
		}
	});

	// Cell menu add row tests: The CellMenu renders outside the table-wrap parent,
	// so the document click handler (handle_click_outside) unmounts it before
	// the menu button's onclick fires in synthetic event dispatch. These
	// interactions are covered by E2E tests in dataframe_events.spec.ts.
	test.todo("add row above via cell menu");
	test.todo("add row below via cell menu");

	test("delete row via cell menu", async () => {
		const { container } = await render(Dataframe, dynamic_props);
		await wait();

		const cell = get_cell(container, 1, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const menu_btn = cell.querySelector(".cell-menu-button") as HTMLElement;
		expect(menu_btn).toBeTruthy();
		await fireEvent.click(menu_btn);
		await wait();

		const delete_btn = document.querySelector(
			'[aria-label="Delete row"]'
		) as HTMLElement;
		expect(delete_btn).toBeTruthy();
		await fireEvent.click(delete_btn);
		await wait();

		expect(get_rows(container).length).toBe(2);
	});

	test("add column via header menu", async () => {
		const { container } = await render(Dataframe, dynamic_props);
		await wait();

		const initial_headers = get_header_cells(container).length;

		// Click a header to select it and show menu
		const headers = get_header_cells(container);
		const header = headers[0] as HTMLElement;
		const menu_btn = header.querySelector(".cell-menu-button") as HTMLElement;
		if (menu_btn) {
			await fireEvent.click(menu_btn);
			await wait();

			const add_col_btn = document.querySelector(
				'[aria-label="Add column to the right"]'
			) as HTMLElement;
			if (add_col_btn) {
				await fireEvent.click(add_col_btn);
				await wait();

				expect(get_header_cells(container).length).toBe(initial_headers + 1);
			}
		}
	});

	test("delete column via header menu", async () => {
		const { container } = await render(Dataframe, dynamic_props);
		await wait();

		const initial_headers = get_header_cells(container).length;

		const headers = get_header_cells(container);
		const header = headers[0] as HTMLElement;
		const menu_btn = header.querySelector(".cell-menu-button") as HTMLElement;
		if (menu_btn) {
			await fireEvent.click(menu_btn);
			await wait();

			const delete_col_btn = document.querySelector(
				'[aria-label="Delete column"]'
			) as HTMLElement;
			if (delete_col_btn) {
				await fireEvent.click(delete_col_btn);
				await wait();

				expect(get_header_cells(container).length).toBe(initial_headers - 1);
			}
		}
	});
});

describe("Cell menu visibility on static cells", () => {
	afterEach(() => cleanup());

	test("context menu does not open on a static column cell", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			static_columns: [0]
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.contextMenu(cell);
		await wait();

		expect(within(document.body).queryByRole("menu")).toBeNull();
	});

	test("context menu does not open when interactive is false", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			interactive: false,
			editable: false
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.contextMenu(cell);
		await wait();

		expect(within(document.body).queryByRole("menu")).toBeNull();
	});

	test("context menu does open on an editable, non-static cell", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			row_count: [3, "dynamic"] as [number, "fixed" | "dynamic"]
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.contextMenu(cell);
		await wait();

		expect(within(document.body).queryByRole("menu")).not.toBeNull();
	});

	test("cell menu button does not render on a static column cell", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			static_columns: [0]
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		expect(cell.querySelector(".cell-menu-button")).toBeNull();
	});
});

describe("Delete/clear cells", () => {
	afterEach(() => cleanup());

	test("Delete key clears selected cell value", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		// Press Escape first to ensure we're in selection mode, not edit mode
		await fireEvent.keyDown(table_wrap, { key: "Escape" });
		await fireEvent.keyDown(table_wrap, { key: "Delete" });
		await wait();

		// Cell should be empty
		const cell_text = get_cell(container, 0, 0)?.textContent?.trim();
		expect(cell_text === "" || cell_text === "⋮").toBe(true);
	});

	test("Backspace key clears selected cell value", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 1)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "Escape" });
		await fireEvent.keyDown(table_wrap, { key: "Backspace" });
		await wait();

		const cell_text = get_cell(container, 0, 1)?.textContent?.trim();
		expect(cell_text === "" || cell_text === "⋮").toBe(true);
	});

	test("Delete key does not clear static column cells", async () => {
		const { container } = await render(Dataframe, {
			...default_props,
			static_columns: [0]
		});
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "Escape" });
		await fireEvent.keyDown(table_wrap, { key: "Delete" });
		await wait();

		// Static cell should still have its value
		expect(get_cell(container, 0, 0)?.textContent).toContain("Alice");
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted when value changes from outside via set_data", async () => {
		const { listen, set_data } = await render(Dataframe, default_props);
		await wait();

		const change = listen("change");

		await set_data({
			value: {
				data: [
					["X", "Y", "Z"],
					["1", "2", "3"],
					["4", "5", "6"]
				],
				headers: ["Name", "Age", "Role"],
				metadata: null
			}
		});
		await wait();

		expect(change).toHaveBeenCalled();
	});

	test("select: emitted when cell is clicked", async () => {
		const { container, listen } = await render(Dataframe, default_props);
		await wait();

		const select = listen("select");

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		expect(select).toHaveBeenCalled();
	});

	test("change: emitted when cell is edited", async () => {
		const { container, listen } = await render(Dataframe, default_props);
		await wait();

		const change = listen("change");

		// Double-click to enter edit mode
		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		) as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = "NewValue";
			await fireEvent.input(textarea);
			await tick();

			// Press Enter to confirm
			const table_wrap = get_table_wrap(container)!;
			await fireEvent.keyDown(table_wrap, { key: "Enter" });
			await wait();

			expect(change).toHaveBeenCalled();
		}
	});

	test("input: emitted on cell edit", async () => {
		const { container, listen } = await render(Dataframe, default_props);
		await wait();

		const input = listen("input");

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		) as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = "Changed";
			await fireEvent.input(textarea);
			await tick();

			const table_wrap = get_table_wrap(container)!;
			await fireEvent.keyDown(table_wrap, { key: "Enter" });
			await wait();

			expect(input).toHaveBeenCalled();
		}
	});

	test("edit: emitted with old and new value on cell edit", async () => {
		const { container, listen } = await render(Dataframe, default_props);
		await wait();

		const edit = listen("edit");

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await tick();
		await fireEvent.dblClick(cell);
		await wait();

		const textarea = container.querySelector(
			"textarea[aria-label='Edit cell']"
		) as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = "Zara";
			await fireEvent.input(textarea);
			await tick();

			const table_wrap = get_table_wrap(container)!;
			await fireEvent.keyDown(table_wrap, { key: "Enter" });
			await wait();

			expect(edit).toHaveBeenCalled();
			const call_args = edit.mock.calls[0][0];
			expect(call_args.value).toBe("Zara");
			expect(call_args.previous_value).toBe("Alice");
		}
	});
});

describe("Copy", () => {
	afterEach(() => cleanup());

	test("Cmd+C copies selected cell to clipboard", async () => {
		const { container } = await render(Dataframe, default_props);
		await wait();

		const cell = get_cell(container, 0, 0)!;
		await fireEvent.mouseDown(cell);
		await wait();

		const table_wrap = get_table_wrap(container)!;
		await fireEvent.keyDown(table_wrap, { key: "c", metaKey: true });

		// handle_copy() is async but called without await in the keydown handler,
		// so the clipboard write may not be complete immediately. Poll until it settles.
		await waitFor(async () => {
			expect(await navigator.clipboard.readText()).toBe("Alice");
		});
	});
});

describe("Boolean column select-all header checkbox", () => {
	afterEach(() => cleanup());

	const bool_props = {
		...default_props,
		value: {
			data: [
				["Alice", true, false],
				["Bob", false, false],
				["Carol", true, false]
			],
			headers: ["Name", "Active", "Admin"],
			metadata: null
		},
		datatype: ["str", "bool", "bool"] as any,
		col_count: [3, "fixed"] as [number, "fixed" | "dynamic"]
	};

	function get_header(container: HTMLElement, col_idx: number): HTMLElement {
		return container.querySelector<HTMLElement>(
			`th[data-heading='${col_idx}']`
		)!;
	}

	function get_header_checkbox(
		container: HTMLElement,
		col_idx: number
	): HTMLInputElement {
		return within(get_header(container, col_idx)).getByTestId(
			"checkbox"
		) as HTMLInputElement;
	}

	test("renders checkbox in bool column header (interactive mode)", async () => {
		const { container } = await render(Dataframe, bool_props);
		await wait();

		expect(get_header_checkbox(container, 1)).toBeInTheDocument();
		expect(get_header_checkbox(container, 2)).toBeInTheDocument();

		expect(
			within(get_header(container, 0)).queryByTestId("checkbox")
		).not.toBeInTheDocument();
	});

	test("does not render checkbox when not interactive", async () => {
		const { container } = await render(Dataframe, {
			...bool_props,
			interactive: false
		});
		await wait();

		expect(
			within(get_header(container, 1)).queryByTestId("checkbox")
		).not.toBeInTheDocument();
	});

	test("header checkbox reflects indeterminate state for mixed column", async () => {
		const { container } = await render(Dataframe, bool_props);
		await wait();

		const active = get_header_checkbox(container, 1);
		expect(active.indeterminate).toBe(true);
		expect(active.checked).toBe(false);
	});

	test("header checkbox is checked when all column values are true", async () => {
		const { container } = await render(Dataframe, {
			...bool_props,
			value: {
				data: [
					["Alice", true],
					["Bob", true]
				],
				headers: ["Name", "Active"],
				metadata: null
			},
			datatype: ["str", "bool"] as any,
			col_count: [2, "fixed"] as [number, "fixed" | "dynamic"]
		});
		await wait();

		const active = get_header_checkbox(container, 1);
		expect(active.checked).toBe(true);
		expect(active.indeterminate).toBe(false);
	});

	test("clicking indeterminate header checkbox sets all column cells to true", async () => {
		const { container, listen } = await render(Dataframe, bool_props);
		await wait();

		const change = listen("change");
		await fireEvent.click(get_header_checkbox(container, 1));
		await wait();

		const data = change.mock.calls.at(-1)?.[0].data;
		expect(data).toEqual([
			["Alice", true, false],
			["Bob", true, false],
			["Carol", true, false]
		]);

		const updated = get_header_checkbox(container, 1);
		expect(updated.checked).toBe(true);
		expect(updated.indeterminate).toBe(false);
	});

	test("clicking fully-checked header checkbox sets all column cells to false", async () => {
		const { container, listen } = await render(Dataframe, {
			...bool_props,
			value: {
				data: [
					["Alice", true, false],
					["Bob", true, false]
				],
				headers: ["Name", "Active", "Admin"],
				metadata: null
			}
		});
		await wait();

		const change = listen("change");
		await fireEvent.click(get_header_checkbox(container, 1));
		await wait();

		const data = change.mock.calls.at(-1)?.[0].data;
		expect(data).toEqual([
			["Alice", false, false],
			["Bob", false, false]
		]);
	});

	test("toggling one bool header does not affect cells in other bool columns", async () => {
		const { container, listen } = await render(Dataframe, {
			...bool_props,
			value: {
				data: [
					["Alice", false, true],
					["Bob", false, true],
					["Carol", false, true]
				],
				headers: ["Name", "Active", "Admin"],
				metadata: null
			}
		});
		await wait();

		const change = listen("change");
		await fireEvent.click(get_header_checkbox(container, 1));
		await wait();

		const data = change.mock.calls.at(-1)?.[0].data;
		expect(data).toEqual([
			["Alice", true, true],
			["Bob", true, true],
			["Carol", true, true]
		]);

		const admin = get_header_checkbox(container, 2);
		expect(admin.checked).toBe(true);
		expect(admin.indeterminate).toBe(false);
	});
});
