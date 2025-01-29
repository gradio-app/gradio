<script lang="ts">
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
		userEvent.click(cell_400);

		const open_dialog_btn = within(cell_400).getByText("⋮");
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

		// Test copy functionality
		const copy_button = canvas.getByRole("button", {
			name: /copy table data/i
		});
		await userEvent.click(copy_button);

		// Wait for copy feedback animation
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Test fullscreen functionality
		const fullscreen_button = canvas.getByRole("button", {
			name: /enter fullscreen/i
		});
		await userEvent.click(fullscreen_button);

		// Wait to show fullscreen state
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Exit fullscreen
		await userEvent.click(fullscreen_button);
	}}
/>
