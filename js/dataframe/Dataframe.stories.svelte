<script lang="ts">
	// @ts-nocheck
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Table from "./shared/Table.svelte";
	import { within } from "@testing-library/dom";
	import { userEvent } from "@storybook/test";
	import { get } from "svelte/store";
	import { format } from "svelte-i18n";
</script>

<Meta
	title="Components/DataFrame"
	component={Table}
	parameters={{
		test: {
			dangerouslyIgnoreUnhandledErrors: true // ignore fullscreen permission error
		}
	}}
	argTypes={{
		editable: {
			control: [true, false],
			description: "Whether the DataFrame is editable",
			name: "interactive",
			value: true
		}
	}}
/>

<Template let:args>
	<Table {...args} i18n={get(format)} />
</Template>

<Story
	name="Interactive dataframe"
	args={{
		values: [
			["Cat", 5],
			["Horse", 3],
			["Snake", 1]
		],
		headers: ["Animal", "Votes"],
		label: "Animals",
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Interactive dataframe with label"
	args={{
		values: [
			["Cat", 5],
			["Horse", 3],
			["Snake", 1]
		],
		headers: ["Animal", "Votes"],
		label: "Animals",
		show_label: true,
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Interactive dataframe no label"
	args={{
		values: [
			["Cat", 5],
			["Horse", 3],
			["Snake", 1]
		],
		headers: ["Animal", "Votes"],
		metadata: null,
		label: "Animals",
		show_label: false,
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Static dataframe"
	args={{
		values: [
			["Cat", 5],
			["Horse", 3],
			["Snake", 1]
		],
		headers: ["Animal", "Votes"],

		label: "Animals",
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"],
		editable: false
	}}
	play={async ({ canvasElement }) => {
		// tests that the cell is not editable

		const canvas = within(canvasElement);
		const cells = canvas.getAllByRole("cell");
		const initial_value = cells[0].textContent;

		await userEvent.click(cells[0]);
		await userEvent.keyboard("new value");

		const final_value = cells[0].textContent;
		if (initial_value !== final_value) {
			throw new Error("Cell content changed when it should be non-editable");
		}

		const inputs = canvas.queryAllByRole("textbox");
		if (inputs.length > 0) {
			throw new Error("Input field appeared when table should be non-editable");
		}
	}}
/>

<Story
	name="Dataframe with different precisions"
	args={{
		values: [
			[1.24, 1.24, 1.24],
			[1.21, 1.21, 1.21]
		],
		headers: ["Precision=0", "Precision=1", "Precision=2"],
		display_value: [
			["1", "1.2", "1.24"],
			["1", "1.2", "1.21"]
		],
		label: "Numbers",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with markdown and math"
	args={{
		values: [
			["Linear", "$y=x$", "Has a *maximum*  of 1 root"],
			["Quadratic", "$y=x^2$", "Has a *maximum*  of 2 roots"],
			["Cubic", "$y=x^3$", "Has a *maximum*  of 3 roots"]
		],
		headers: ["Type", "Example", "Roots"],
		datatype: ["str", "markdown", "markdown"],
		latex_delimiters: [{ left: "$", right: "$", display: false }],
		label: "Math",
		col_count: [3, "dynamic"],
		row_count: [3, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with different colors"
	args={{
		values: [
			[800, 100, 800],
			[200, 800, 700]
		],
		headers: ["Math", "Reading", "Writing"],

		styling: [
			[
				"background-color:teal; color: white",
				"1.2",
				"background-color:teal; color: white"
			],
			["1", "background-color:teal; color: white", "1.21"]
		],
		label: "Test scores",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with column widths"
	args={{
		values: [
			[800, 100, 800],
			[200, 800, 700]
		],
		headers: ["Narrow", "Wide", "Half"],
		label: "Test scores",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		column_widths: ["20%", "30%", "50%"],
		editable: false
	}}
/>

<Story
	name="Dataframe with zero row count"
	args={{
		values: [],
		headers: ["Narrow", "Wide", "Half"],
		label: "Test scores",
		col_count: [0, "dynamic"],
		row_count: [0, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with dialog interactions"
	args={{
		values: [
			[800, 100, 400],
			[200, 800, 700]
		],
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		headers: ["Math", "Reading", "Writing"],
		editable: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const cell_400 = canvas.getAllByRole("cell")[5];
		await userEvent.click(cell_400);

		const open_dialog_btn = await within(cell_400).findByRole("button", {
			name: "⋮"
		});
		await userEvent.click(open_dialog_btn);

		const add_row_btn = canvas.getByText("Add row above");
		await userEvent.click(add_row_btn);

		const new_cell = canvas.getAllByRole("cell")[9];
		userEvent.click(new_cell);
	}}
/>

<Story
	name="Dataframe with fullscreen button"
	args={{
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		headers: ["Math", "Reading", "Writing"],
		values: [
			[800, 100, 400],
			[200, 800, 700]
		],
		show_fullscreen_button: true
	}}
/>

<Story
	name="Dataframe with multiple selection interactions"
	args={{
		values: [
			[1, 2, 3, 4],
			[5, 6, 7, 8],
			[9, 10, 11, 12],
			[13, 14, 15, 16]
		],
		col_count: [4, "dynamic"],
		row_count: [4, "dynamic"],
		headers: ["A", "B", "C", "D"],
		editable: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const cells = canvas.getAllByRole("cell");
		const user = userEvent.setup();

		// cmd+click to select non-contiguous cells
		await user.keyboard("[MetaLeft>]");
		await user.click(cells[4]);
		await user.click(cells[6]);
		await user.click(cells[2]);
		await user.keyboard("[/MetaLeft]");

		// shift+click to select a range
		await user.keyboard("[ShiftLeft>]");
		await user.click(cells[7]);
		await user.click(cells[6]);
		await user.keyboard("[/ShiftLeft]");

		// clear selected cells
		await user.keyboard("{Delete}");

		// verify cells were cleared by clicking one
		await user.click(cells[2]);
	}}
/>

<Story
	name="Dataframe toolbar interactions"
	args={{
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		headers: ["Math", "Reading", "Writing"],
		values: [
			[800, 100, 400],
			[200, 800, 700]
		],
		show_fullscreen_button: true,
		show_copy_button: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const copy_button = canvas.getByRole("button", {
			name: "Copy table data"
		});
		await userEvent.click(copy_button);

		const fullscreen_button = canvas.getByRole("button", {
			name: "Enter fullscreen"
		});
		await userEvent.click(fullscreen_button);

		await userEvent.click(fullscreen_button);
	}}
/>

<Story
	name="Dataframe with truncated text"
	args={{
		values: [
			[
				"This is a very long text that should be truncated",
				"Short text",
				"Another very long text that needs truncation"
			],
			[
				"Short",
				"This text is also quite long and should be truncated as well",
				"Medium length text here"
			],
			[
				"Medium text",
				"Brief",
				"This is the longest text in the entire table and it should definitely be truncated"
			]
		],
		headers: ["Column A", "Column B", "Column C"],
		label: "Truncated Text Example",
		max_chars: 20,
		col_count: [3, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Dataframe with multiline headers"
	args={{
		values: [
			[95, 92, 88],
			[89, 90, 85],
			[92, 88, 91]
		],
		headers: [
			"Dataset A\nAccuracy",
			"Dataset B\nPrecision",
			"Dataset C\nRecall"
		],
		label: "Model Metrics",
		col_count: [3, "dynamic"],
		row_count: [3, "dynamic"],
		editable: false
	}}
/>
