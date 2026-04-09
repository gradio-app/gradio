import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import FileExplorer from "./Index.svelte";
import type { FileNode } from "./shared/types";

function mock_ls(tree: Record<string, FileNode[]>) {
	return vi.fn(async (path: string[]): Promise<FileNode[]> => {
		const key = path.join("/") || "";
		return tree[key] ?? [];
	});
}

const flat_files: Record<string, FileNode[]> = {
	"": [
		{ type: "file", name: "readme.txt" },
		{ type: "file", name: "data.csv" },
		{ type: "file", name: "image.png" }
	]
};

const nested_tree: Record<string, FileNode[]> = {
	"": [
		{ type: "folder", name: "src" },
		{ type: "file", name: "readme.txt" }
	],
	src: [
		{ type: "file", name: "app.py" },
		{ type: "file", name: "utils.py" }
	]
};

const default_props = {
	label: "File Explorer",
	show_label: true,
	value: [] as string[][],
	file_count: "multiple" as const,
	root_dir: "",
	glob: "*",
	ignore_glob: "",
	interactive: true,
	_selectable: false,
	height: undefined as number | string | undefined,
	min_height: undefined as number | string | undefined,
	max_height: undefined as number | string | undefined,
	server: { ls: mock_ls(flat_files) },
	buttons: null as null
};

// BlockLabel with float={false} doesn't match the shared show_label test pattern.
run_shared_prop_tests({
	component: FileExplorer,
	name: "FileExplorer",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false
});

describe("Label", () => {
	afterEach(() => cleanup());

	test("label is visible when show_label=true", async () => {
		const { getByText } = await render(FileExplorer, {
			...default_props,
			label: "My Files",
			show_label: true
		});

		expect(getByText("My Files")).toBeVisible();
	});

	test("label is hidden when show_label=false", async () => {
		const { getByText } = await render(FileExplorer, {
			...default_props,
			label: "My Files",
			show_label: false
		});

		expect(getByText("My Files")).not.toBeVisible();
	});
});

describe("FileExplorer", () => {
	afterEach(() => cleanup());

	test("renders files returned by ls_fn", async () => {
		const { getByText } = await render(FileExplorer, {
			...default_props
		});

		await waitFor(() => {
			expect(getByText("readme.txt")).toBeVisible();
			expect(getByText("data.csv")).toBeVisible();
			expect(getByText("image.png")).toBeVisible();
		});
	});

	test("renders folders with expand buttons", async () => {
		const { getByText, getByRole } = await render(FileExplorer, {
			...default_props,
			server: { ls: mock_ls(nested_tree) }
		});

		await waitFor(() => {
			expect(getByText("src")).toBeVisible();
			expect(getByText("readme.txt")).toBeVisible();
			expect(getByRole("button", { name: "expand directory" })).toBeVisible();
		});
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true shows checkboxes for files", async () => {
		const { getAllByRole } = await render(FileExplorer, {
			...default_props,
			interactive: true
		});

		await waitFor(() => {
			const checkboxes = getAllByRole("checkbox");
			expect(checkboxes.length).toBe(3);
		});
	});

	test("interactive=false hides checkboxes", async () => {
		const { queryByRole, getByText } = await render(FileExplorer, {
			...default_props,
			interactive: false
		});

		await waitFor(() => {
			expect(getByText("readme.txt")).toBeVisible();
		});

		expect(queryByRole("checkbox")).not.toBeInTheDocument();
	});
});

describe("Props: file_count", () => {
	afterEach(() => cleanup());

	test("file_count='multiple' allows selecting multiple files", async () => {
		const { getAllByRole, get_data } = await render(FileExplorer, {
			...default_props,
			file_count: "multiple"
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		const checkboxes = getAllByRole("checkbox");
		await fireEvent.click(checkboxes[0]);
		await fireEvent.click(checkboxes[1]);

		const data = await get_data();
		expect(data.value.length).toBe(2);
	});

	test("file_count='single' allows only one selection", async () => {
		const { getAllByRole, get_data } = await render(FileExplorer, {
			...default_props,
			file_count: "single"
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		const checkboxes = getAllByRole("checkbox");
		await fireEvent.click(checkboxes[0]);
		await fireEvent.click(checkboxes[1]);

		const data = await get_data();
		expect(data.value.length).toBe(1);
	});
});

describe("Folder navigation", () => {
	afterEach(() => cleanup());

	test("clicking expand opens folder to show children", async () => {
		const { getByRole, getByText, queryByText } = await render(FileExplorer, {
			...default_props,
			server: { ls: mock_ls(nested_tree) }
		});

		await waitFor(() => {
			expect(getByText("src")).toBeVisible();
		});

		expect(queryByText("app.py")).toBeNull();

		await fireEvent.click(getByRole("button", { name: "expand directory" }));

		await waitFor(() => {
			expect(getByText("app.py")).toBeVisible();
			expect(getByText("utils.py")).toBeVisible();
		});
	});

	test("clicking expand again collapses folder", async () => {
		const { getByRole, getByText, queryByText } = await render(FileExplorer, {
			...default_props,
			server: { ls: mock_ls(nested_tree) }
		});

		await waitFor(() => {
			expect(getByText("src")).toBeVisible();
		});

		const expandBtn = getByRole("button", { name: "expand directory" });
		await fireEvent.click(expandBtn);

		await waitFor(() => {
			expect(getByText("app.py")).toBeVisible();
		});

		await fireEvent.click(expandBtn);

		await waitFor(() => {
			expect(queryByText("app.py")).toBeNull();
		});
	});
});

describe("File selection", () => {
	afterEach(() => cleanup());

	test("checking a file adds it to value", async () => {
		const { getAllByRole, get_data } = await render(FileExplorer, {
			...default_props
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		await fireEvent.click(getAllByRole("checkbox")[0]);

		const data = await get_data();
		expect(data.value).toEqual([["readme.txt"]]);
	});

	test("unchecking a file removes it from value", async () => {
		const { getAllByRole, get_data } = await render(FileExplorer, {
			...default_props
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		const cb = getAllByRole("checkbox")[0];
		await fireEvent.click(cb);
		await fireEvent.click(cb);

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("checking a folder selects its children", async () => {
		const { getAllByRole, getByText, get_data } = await render(FileExplorer, {
			...default_props,
			server: { ls: mock_ls(nested_tree) },
			file_count: "multiple"
		});

		await waitFor(() => {
			expect(getByText("src")).toBeVisible();
		});

		// The folder checkbox is the first checkbox (src folder)
		const checkboxes = getAllByRole("checkbox");
		await fireEvent.click(checkboxes[0]);

		await waitFor(async () => {
			const data = await get_data();
			expect(data.value.length).toBeGreaterThan(0);
		});
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("set_data triggers change event", async () => {
		const { listen, set_data } = await render(FileExplorer, {
			...default_props
		});

		const change = listen("change");
		await set_data({ value: [["readme.txt"]] });
		const select = listen("select");

		expect(change).toHaveBeenCalledTimes(1);
		expect(select).not.toHaveBeenCalled();
	});

	test("change fires on mount with initial empty value", async () => {
		const { listen } = await render(FileExplorer, {
			...default_props,
			value: []
		});

		const change = listen("change", { retrospective: true });
		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("checking a file dispatches input event", async () => {
		const { listen, getAllByRole } = await render(FileExplorer, {
			...default_props
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		const input = listen("input");
		await fireEvent.click(getAllByRole("checkbox")[0]);

		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("custom button dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(FileExplorer, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Refresh", id: 2, icon: null }]
		});

		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Refresh"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 2 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns empty array initially", async () => {
		const { get_data } = await render(FileExplorer, {
			...default_props,
			value: []
		});

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("set_data updates value", async () => {
		const { set_data, get_data } = await render(FileExplorer, {
			...default_props
		});

		await set_data({ value: [["readme.txt"]] });

		const data = await get_data();
		expect(data.value).toEqual([["readme.txt"]]);
	});

	test("round-trip: set_data then get_data", async () => {
		const { set_data, get_data } = await render(FileExplorer, {
			...default_props
		});

		const val = [["src", "app.py"], ["readme.txt"]];
		await set_data({ value: val });

		const data = await get_data();
		expect(data.value).toEqual(val);
	});

	test("user click reflected in get_data", async () => {
		const { getAllByRole, get_data } = await render(FileExplorer, {
			...default_props
		});

		await waitFor(() => {
			expect(getAllByRole("checkbox").length).toBe(3);
		});

		await fireEvent.click(getAllByRole("checkbox")[2]);

		const data = await get_data();
		expect(data.value).toEqual([["image.png"]]);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("empty directory renders no items", async () => {
		const { queryByRole, getByText } = await render(FileExplorer, {
			...default_props,
			server: { ls: mock_ls({ "": [] }) }
		});

		await waitFor(() => {
			expect(getByText("File Explorer")).toBeVisible();
		});

		expect(queryByRole("checkbox")).toBeNull();
	});

	test("ls_fn is called with empty path on mount", async () => {
		const ls = mock_ls(flat_files);
		await render(FileExplorer, {
			...default_props,
			server: { ls }
		});

		await waitFor(() => {
			expect(ls).toHaveBeenCalledWith([]);
		});
	});
});
