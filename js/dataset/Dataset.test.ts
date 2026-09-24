import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Dataset from "./Index.svelte";
import DatasetRootExample from "./DatasetRootExample.svelte";
import DatasetTextExample from "./DatasetTextExample.svelte";
import DatasetContextExample from "./DatasetContextExample.svelte";

function loader(component: any) {
	return () => ({
		component: Promise.resolve({ default: component }),
		runtime: false as const
	});
}

const table_props = {
	components: [
		{ name: "textbox", class_id: "textbox" },
		{ name: "textbox", class_id: "textbox" }
	],
	component_props: [{}, {}],
	headers: ["Name", "Field"],
	samples: [
		["Ada", "Math"],
		["Grace", "Compilers"]
	],
	sample_labels: null,
	value: null,
	root: "",
	proxy_url: null,
	samples_per_page: 10,
	layout: "table" as const,
	show_label: true,
	load_component: loader(DatasetTextExample)
};

const gallery_props = {
	...table_props,
	components: [{ name: "textbox", class_id: "textbox" }],
	component_props: [{}],
	headers: ["Name"],
	samples: [["Ada"], ["Grace"]],
	layout: null as "gallery" | "table" | null
};

run_shared_prop_tests({
	component: Dataset,
	name: "Dataset",
	base_props: table_props,
	has_label: false,
	has_validation_error: false
});

describe("Dataset", () => {
	afterEach(() => cleanup());

	test("forwards the shared root to example components", async () => {
		const result = await render(Dataset, {
			components: [{ name: "textbox", class_id: "textbox" }],
			component_props: [{}],
			headers: ["Example"],
			samples: [["sample"]],
			sample_labels: null,
			value: null,
			root: "/gradio-root",
			proxy_url: null,
			samples_per_page: 10,
			layout: "gallery",
			show_label: false,
			load_component: () => ({
				component: Promise.resolve({ default: DatasetRootExample }),
				runtime: false
			})
		});

		await waitFor(() => {
			expect(result.getByTestId("dataset-root")).toHaveTextContent(
				"/gradio-root"
			);
		});
	});

	test("puts one tab stop on a cell instead of the whole grid", async () => {
		const before = document.createElement("button");
		let after: HTMLButtonElement | undefined;
		before.textContent = "Before Dataset";
		document.body.appendChild(before);

		try {
			const result = await render(Dataset, table_props);
			after = document.createElement("button");
			after.textContent = "After Dataset";
			document.body.appendChild(after);

			const cells = await waitFor(() => result.getAllByRole("gridcell"));
			const grid = result.getByRole("grid");

			expect(grid).not.toHaveAttribute("tabindex");
			expect(grid).toHaveAttribute("aria-rowcount", "3");
			expect(grid).toHaveAttribute("aria-colcount", "2");
			expect(cells[0]).toHaveAttribute("tabindex", "0");
			cells
				.slice(1)
				.forEach((cell) => expect(cell).toHaveAttribute("tabindex", "-1"));

			before.focus();
			await event.tab();
			expect(cells[0]).toHaveFocus();

			await event.tab();
			expect(after).toHaveFocus();
		} finally {
			before.remove();
			after?.remove();
		}
	});

	test("moves cell focus with arrow keys and activates rows from the keyboard", async () => {
		const { getAllByRole, listen } = await render(Dataset, table_props);
		const cells = await waitFor(() => getAllByRole("gridcell"));
		const select = listen("select");

		cells[0].focus();
		await event.keyboard("{ArrowRight}");
		expect(cells[1]).toHaveFocus();

		await event.keyboard("{ArrowDown}");
		expect(cells[3]).toHaveFocus();

		await event.keyboard("{Control>}{Home}{/Control}");
		expect(cells[0]).toHaveFocus();

		await event.keyboard(" ");
		expect(select).toHaveBeenCalledWith({
			index: 0,
			value: ["Ada", "Math"]
		});
		expect(cells[0].closest("tr")).toHaveAttribute("aria-selected", "true");
	});

	test("keeps a cell in the tab order when the active row is removed", async () => {
		const result = await render(Dataset, {
			...table_props,
			samples: [...table_props.samples, ["Katherine", "Orbital mechanics"]]
		});
		let cells = await waitFor(() => result.getAllByRole("gridcell"));

		cells[4].focus();
		await waitFor(() => expect(cells[4]).toHaveAttribute("tabindex", "0"));

		await result.set_data({ samples: table_props.samples });
		cells = await waitFor(() => {
			const updated_cells = result.getAllByRole("gridcell");
			expect(updated_cells).toHaveLength(4);
			return updated_cells;
		});

		expect(cells[0]).toHaveAttribute("tabindex", "0");
		cells
			.slice(1)
			.forEach((cell) => expect(cell).toHaveAttribute("tabindex", "-1"));
	});

	test("omits the header row and reports row positions when headers are missing", async () => {
		const result = await render(Dataset, { ...table_props, headers: [] });
		const grid = await waitFor(() => result.getByRole("grid"));

		expect(grid).toHaveAttribute("aria-colcount", "2");
		expect(grid).toHaveAttribute("aria-rowcount", "2");
		expect(result.queryByRole("columnheader")).not.toBeInTheDocument();
		const rows = result.getAllByRole("row");
		expect(rows).toHaveLength(2);
		expect(rows[0]).toHaveAttribute("aria-rowindex", "1");
		expect(rows[1]).toHaveAttribute("aria-rowindex", "2");
	});

	test("reports row positions across all pages", async () => {
		const samples = Array.from({ length: 25 }, (_, i) => [
			`Person ${i + 1}`,
			`Field ${i + 1}`
		]);
		const result = await render(Dataset, {
			...table_props,
			samples,
			samples_per_page: 10
		});
		const grid = await waitFor(() => result.getByRole("grid"));

		expect(grid).toHaveAttribute("aria-rowcount", "26");
		await event.click(result.getByRole("button", { name: "3" }));

		const rows = await waitFor(() => {
			const updated_rows = result.getAllByRole("row");
			expect(updated_rows).toHaveLength(6);
			return updated_rows;
		});
		expect(rows[1]).toHaveAttribute("aria-rowindex", "22");
	});
});

describe("Props: layout", () => {
	afterEach(() => cleanup());

	test("layout: 'table' renders the samples as a grid", async () => {
		const { getByRole } = await render(Dataset, table_props);

		await waitFor(() => expect(getByRole("grid")).toBeVisible());
	});

	test("a single component defaults to the gallery layout", async () => {
		const { queryByRole, getByText } = await render(Dataset, gallery_props);

		await waitFor(() => expect(getByText("Ada")).toBeVisible());
		expect(queryByRole("grid")).not.toBeInTheDocument();
	});

	test("two or more components default to the table layout", async () => {
		const { getByRole } = await render(Dataset, {
			...table_props,
			layout: null
		});

		await waitFor(() => expect(getByRole("grid")).toBeVisible());
	});

	test("layout: 'table' overrides the single-component gallery default", async () => {
		const { getByRole } = await render(Dataset, {
			...gallery_props,
			layout: "table"
		});

		await waitFor(() => expect(getByRole("grid")).toBeVisible());
	});

	test("layout: 'gallery' does not force a gallery when there are two components", async () => {
		// `gallery` is (components.length < 2 || sample_labels !== null) &&
		// layout !== "table" — asking for "gallery" with two columns still gets
		// the table, because the first half of that condition is false.
		const { getByRole } = await render(Dataset, {
			...table_props,
			layout: "gallery"
		});

		await waitFor(() => expect(getByRole("grid")).toBeVisible());
	});

	test("gallery samples are rendered as buttons", async () => {
		const { getByRole } = await render(Dataset, gallery_props);

		await waitFor(() => {
			expect(getByRole("button", { name: "Ada" })).toBeVisible();
			expect(getByRole("button", { name: "Grace" })).toBeVisible();
		});
	});
});

describe("Props: sample_labels", () => {
	afterEach(() => cleanup());

	test("sample_labels are rendered instead of the samples", async () => {
		const { getByText, queryByText } = await render(Dataset, {
			...table_props,
			layout: null,
			sample_labels: ["First label", "Second label"]
		});

		await waitFor(() => expect(getByText("First label")).toBeVisible());
		expect(getByText("Second label")).toBeVisible();
		expect(queryByText("Ada")).not.toBeInTheDocument();
	});

	test("sample_labels force the gallery layout even with several components", async () => {
		const { queryByRole, getByText } = await render(Dataset, {
			...table_props,
			layout: null,
			sample_labels: ["First label", "Second label"]
		});

		await waitFor(() => expect(getByText("First label")).toBeVisible());
		expect(queryByRole("grid")).not.toBeInTheDocument();
	});

	test("clicking a labelled sample dispatches select with its index", async () => {
		const { getByRole, listen } = await render(Dataset, {
			...table_props,
			layout: null,
			sample_labels: ["First label", "Second label"]
		});
		const select = listen("select");

		await waitFor(() => getByRole("button", { name: "Second label" }));
		await event.click(getByRole("button", { name: "Second label" }));

		expect(select).toHaveBeenCalledWith({
			index: 1,
			value: ["Second label"]
		});
	});
});

describe("Props: headers", () => {
	afterEach(() => cleanup());

	test("each header is rendered as a column header", async () => {
		const { getAllByRole } = await render(Dataset, table_props);

		const headers = await waitFor(() => getAllByRole("columnheader"));
		expect(headers.map((h) => h.textContent?.trim())).toEqual([
			"Name",
			"Field"
		]);
	});

	test("column headers are numbered left to right", async () => {
		const { getAllByRole } = await render(Dataset, table_props);

		const headers = await waitFor(() => getAllByRole("columnheader"));
		expect(headers[0]).toHaveAttribute("aria-colindex", "1");
		expect(headers[1]).toHaveAttribute("aria-colindex", "2");
	});
});

describe("Props: samples", () => {
	afterEach(() => cleanup());

	test("every sample cell is rendered", async () => {
		const { getByText } = await render(Dataset, table_props);

		await waitFor(() => {
			expect(getByText("Ada")).toBeVisible();
			expect(getByText("Math")).toBeVisible();
			expect(getByText("Grace")).toBeVisible();
			expect(getByText("Compilers")).toBeVisible();
		});
	});

	test("no grid is rendered when there are no samples", async () => {
		const { queryByRole } = await render(Dataset, {
			...table_props,
			samples: []
		});

		await waitFor(() => {
			expect(queryByRole("grid")).not.toBeInTheDocument();
		});
	});

	test("a null samples list renders no grid", async () => {
		const { queryByRole } = await render(Dataset, {
			...table_props,
			samples: null
		});

		await waitFor(() => {
			expect(queryByRole("grid")).not.toBeInTheDocument();
		});
	});

	test("each row has one cell per component", async () => {
		const { getAllByRole } = await render(Dataset, table_props);

		const rows = await waitFor(() => getAllByRole("row"));
		// one header row plus two sample rows
		expect(rows).toHaveLength(3);
		expect(getAllByRole("gridcell")).toHaveLength(4);
	});
});

describe("Props: samples_per_page", () => {
	afterEach(() => cleanup());

	const many_samples = Array.from({ length: 25 }, (_, i) => [
		`Person ${i + 1}`,
		`Field ${i + 1}`
	]);

	test("no pagination is shown when the samples fit on one page", async () => {
		const { queryByText } = await render(Dataset, table_props);

		await waitFor(() => {
			expect(queryByText("Pages:")).not.toBeInTheDocument();
		});
	});

	test("only one page of samples is rendered at a time", async () => {
		const { getByText, queryByText } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 10
		});

		await waitFor(() => expect(getByText("Person 1")).toBeVisible());
		expect(queryByText("Person 11")).not.toBeInTheDocument();
	});

	test("a page button is rendered for each page", async () => {
		const { getByRole } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 10
		});

		await waitFor(() => {
			expect(getByRole("button", { name: "1" })).toBeVisible();
			expect(getByRole("button", { name: "2" })).toBeVisible();
			expect(getByRole("button", { name: "3" })).toBeVisible();
		});
	});

	test("clicking a page button shows that page's samples", async () => {
		const { getByRole, getByText, queryByText } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 10
		});

		await waitFor(() => getByRole("button", { name: "2" }));
		await event.click(getByRole("button", { name: "2" }));

		await waitFor(() => expect(getByText("Person 11")).toBeVisible());
		expect(queryByText("Person 1")).not.toBeInTheDocument();
	});

	test("a smaller samples_per_page splits the samples into more pages", async () => {
		const { getByRole, getByText, queryByText } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 5
		});

		await waitFor(() => expect(getByText("Person 5")).toBeVisible());
		expect(queryByText("Person 6")).not.toBeInTheDocument();
		expect(getByRole("button", { name: "5" })).toBeVisible();
	});

	test("distant pages are collapsed behind an ellipsis", async () => {
		const { getByText, queryByRole } = await render(Dataset, {
			...table_props,
			samples: Array.from({ length: 200 }, (_, i) => [
				`Person ${i + 1}`,
				`Field ${i + 1}`
			]),
			samples_per_page: 10
		});

		await waitFor(() => expect(getByText("...")).toBeVisible());
		expect(queryByRole("button", { name: "10" })).not.toBeInTheDocument();
	});

	test("selecting a sample on a later page reports its overall index", async () => {
		const { getByRole, getByText, listen } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 10
		});
		const select = listen("select");

		await waitFor(() => getByRole("button", { name: "3" }));
		await event.click(getByRole("button", { name: "3" }));
		await waitFor(() => expect(getByText("Person 21")).toBeVisible());

		await event.click(getByText("Person 21"));

		expect(select).toHaveBeenCalledWith({
			index: 20,
			value: ["Person 21", "Field 21"]
		});
	});

	test("a new set of samples resets the view to the first page", async () => {
		const { getByRole, getByText, set_data } = await render(Dataset, {
			...table_props,
			samples: many_samples,
			samples_per_page: 10
		});

		await waitFor(() => getByRole("button", { name: "3" }));
		await event.click(getByRole("button", { name: "3" }));
		await waitFor(() => expect(getByText("Person 21")).toBeVisible());

		await set_data({
			samples: Array.from({ length: 25 }, (_, i) => [
				`Other ${i + 1}`,
				`Field ${i + 1}`
			])
		});

		await waitFor(() => expect(getByText("Other 1")).toBeVisible());
	});
});

describe("Props: show_label / label", () => {
	afterEach(() => cleanup());

	// Dataset renders its own .label div rather than a BlockLabel, so
	// run_shared_prop_tests' label assertions (which look for block-info) do not
	// apply and these cover the same ground for this component.
	test("show_label: true renders the label", async () => {
		const { getByText } = await render(Dataset, {
			...table_props,
			show_label: true,
			label: "Sample inputs"
		});

		expect(getByText("Sample inputs")).toBeVisible();
	});

	test("show_label: false removes the label from the DOM", async () => {
		const { queryByText } = await render(Dataset, {
			...table_props,
			show_label: false,
			label: "Sample inputs"
		});

		expect(queryByText("Sample inputs")).not.toBeInTheDocument();
	});

	test("an empty label falls back to 'Examples'", async () => {
		const { getByText } = await render(Dataset, {
			...table_props,
			show_label: true,
			label: ""
		});

		expect(getByText("Examples")).toBeVisible();
	});
});

describe("Example component props", () => {
	afterEach(() => cleanup());

	test("table cells receive the table type and their row index", async () => {
		const { getAllByTestId } = await render(Dataset, {
			...table_props,
			load_component: loader(DatasetContextExample)
		});

		const cells = await waitFor(() => getAllByTestId("dataset-context"));
		expect(cells[0]).toHaveTextContent("Ada|table|0|");
		expect(cells[2]).toHaveTextContent("Grace|table|1|");
	});

	test("gallery items receive the gallery type", async () => {
		const { getAllByTestId } = await render(Dataset, {
			...gallery_props,
			load_component: loader(DatasetContextExample)
		});

		const items = await waitFor(() => getAllByTestId("dataset-context"));
		expect(items[0]).toHaveTextContent("Ada|gallery|0|");
	});

	test("component_props are forwarded to the example component", async () => {
		const { getAllByTestId } = await render(Dataset, {
			...table_props,
			component_props: [{ badge: "first-column" }, { badge: "second-column" }],
			load_component: loader(DatasetContextExample)
		});

		const cells = await waitFor(() => getAllByTestId("dataset-context"));
		expect(cells[0]).toHaveTextContent("first-column");
		expect(cells[1]).toHaveTextContent("second-column");
	});

	test("samples_dir is built from the root", async () => {
		const { getAllByTestId } = await render(Dataset, {
			...table_props,
			root: "/gradio-root",
			load_component: loader(DatasetContextExample)
		});

		const cells = await waitFor(() => getAllByTestId("dataset-context"));
		expect(cells[0]).toHaveTextContent("/gradio-root/file=");
	});

	test("proxy_url takes precedence over the root in samples_dir", async () => {
		const { getAllByTestId } = await render(Dataset, {
			...table_props,
			root: "/gradio-root",
			proxy_url: "https://example.com/",
			load_component: loader(DatasetContextExample)
		});

		const cells = await waitFor(() => getAllByTestId("dataset-context"));
		expect(cells[0]).toHaveTextContent("/proxy=https://example.com/file=");
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("clicking a row dispatches click", async () => {
		const { getByText, listen } = await render(Dataset, table_props);
		const click = listen("click");

		await waitFor(() => getByText("Ada"));
		await event.click(getByText("Ada"));

		expect(click).toHaveBeenCalledTimes(1);
	});

	test("clicking a row dispatches select with the row index and values", async () => {
		const { getByText, listen } = await render(Dataset, table_props);
		const select = listen("select");

		await waitFor(() => getByText("Grace"));
		await event.click(getByText("Grace"));

		expect(select).toHaveBeenCalledWith({
			index: 1,
			value: ["Grace", "Compilers"]
		});
	});

	test("clicking a row dispatches change as the value moves", async () => {
		const { getByText, listen } = await render(Dataset, table_props);
		const change = listen("change");

		await waitFor(() => getByText("Grace"));
		await event.click(getByText("Grace"));

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("clicking a gallery item dispatches click and select", async () => {
		const { getByRole, listen } = await render(Dataset, gallery_props);
		const click = listen("click");
		const select = listen("select");

		await waitFor(() => getByRole("button", { name: "Grace" }));
		await event.click(getByRole("button", { name: "Grace" }));

		expect(click).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({ index: 1, value: ["Grace"] });
	});

	test("change is not dispatched on mount", async () => {
		const { listen, getByText } = await render(Dataset, table_props);
		const change = listen("change", { retrospective: true });

		await waitFor(() => getByText("Ada"));

		expect(change).not.toHaveBeenCalled();
	});

	test("re-selecting the same row does not dispatch change again", async () => {
		const { getByText, listen } = await render(Dataset, table_props);
		const change = listen("change");

		await waitFor(() => getByText("Ada"));
		await event.click(getByText("Ada"));
		await event.click(getByText("Math"));

		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the selected index", async () => {
		const { getByText, get_data } = await render(Dataset, table_props);

		await waitFor(() => getByText("Grace"));
		await event.click(getByText("Grace"));

		expect((await get_data()).value).toBe(1);
	});

	test("get_data returns null before anything is selected", async () => {
		const { get_data, getByText } = await render(Dataset, table_props);

		await waitFor(() => getByText("Ada"));

		expect((await get_data()).value).toBeNull();
	});

	test("set_data marks the matching row as selected", async () => {
		const { getAllByRole, set_data } = await render(Dataset, table_props);
		await waitFor(() => getAllByRole("gridcell"));

		await set_data({ value: 1 });

		await waitFor(() => {
			const rows = getAllByRole("row");
			expect(rows[2]).toHaveAttribute("aria-selected", "true");
			expect(rows[1]).toHaveAttribute("aria-selected", "false");
		});
	});

	test("set_data round-trips through get_data", async () => {
		const { set_data, get_data, getByText } = await render(
			Dataset,
			table_props
		);
		await waitFor(() => getByText("Ada"));

		await set_data({ value: 0 });

		expect((await get_data()).value).toBe(0);
	});

	test("set_data replaces the rendered samples", async () => {
		const { set_data, getByText, queryByText } = await render(
			Dataset,
			table_props
		);
		await waitFor(() => getByText("Ada"));

		await set_data({
			samples: [
				["Katherine", "Orbital mechanics"],
				["Dorothy", "FORTRAN"]
			]
		});

		await waitFor(() => expect(getByText("Katherine")).toBeVisible());
		expect(queryByText("Ada")).not.toBeInTheDocument();
	});

	test("set_data can swap the headers", async () => {
		const { set_data, getAllByRole } = await render(Dataset, table_props);
		await waitFor(() => getAllByRole("columnheader"));

		await set_data({ headers: ["Person", "Speciality"] });

		await waitFor(() => {
			expect(
				getAllByRole("columnheader").map((h) => h.textContent?.trim())
			).toEqual(["Person", "Speciality"]);
		});
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("a gallery skips samples whose first cell is null", async () => {
		const { getByRole, queryByRole } = await render(Dataset, {
			...gallery_props,
			samples: [["Ada"], [null], ["Grace"]]
		});

		await waitFor(() =>
			expect(getByRole("button", { name: "Ada" })).toBeVisible()
		);
		expect(getByRole("button", { name: "Grace" })).toBeVisible();
		expect(queryByRole("button", { name: "null" })).not.toBeInTheDocument();
	});

	test("a component with no matching sample column renders no extra cell", async () => {
		const { getAllByRole } = await render(Dataset, {
			...table_props,
			samples: [["Ada"], ["Grace"]]
		});

		await waitFor(() => {
			expect(getAllByRole("gridcell")).toHaveLength(2);
		});
	});

	test("renders samples that contain empty strings", async () => {
		const { getAllByRole } = await render(Dataset, {
			...table_props,
			samples: [["", "Math"]]
		});

		await waitFor(() => {
			expect(getAllByRole("gridcell")).toHaveLength(2);
		});
	});
});
