<script lang="ts">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import { Gradio } from "../app/src/gradio_helper";
	import Table from "./shared/Table.svelte";
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
	<Table {...args} i18n={(s) => s} />
</Template>

<Story
	name="Interactive dataframe"
	args={{
		value: {
			data: [
				["Cat", 5],
				["Horse", 3],
				["Snake", 1]
			],
			headers: ["Animal", "Votes"],
			metadata: null
		},
		label: "Animals",
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Interactive dataframe with label"
	args={{
		value: {
			data: [
				["Cat", 5],
				["Horse", 3],
				["Snake", 1]
			],
			headers: ["Animal", "Votes"],
			metadata: null
		},
		label: "Animals",
		show_label: true,
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Interactive dataframe no label"
	args={{
		value: {
			data: [
				["Cat", 5],
				["Horse", 3],
				["Snake", 1]
			],
			headers: ["Animal", "Votes"],
			metadata: null
		},
		label: "Animals",
		show_label: false,
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"]
	}}
/>

<Story
	name="Static dataframe"
	args={{
		value: {
			data: [
				["Cat", 5],
				["Horse", 3],
				["Snake", 1]
			],
			headers: ["Animal", "Votes"],
			metadata: null
		},
		label: "Animals",
		col_count: [2, "dynamic"],
		row_count: [3, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with different precisions"
	args={{
		value: {
			data: [
				[1.24, 1.24, 1.24],
				[1.21, 1.21, 1.21]
			],
			headers: ["Precision=0", "Precision=1", "Precision=2"],
			metadata: {
				display_value: [
					["1", "1.2", "1.24"],
					["1", "1.2", "1.21"]
				]
			}
		},
		label: "Numbers",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with markdown and math"
	args={{
		value: {
			data: [
				["Linear", "$y=x$", "Has a *maximum*  of 1 root"],
				["Quadratic", "$y=x^2$", "Has a *maximum*  of 2 roots"],
				["Cubic", "$y=x^3$", "Has a *maximum*  of 3 roots"]
			],
			headers: ["Type", "Example", "Roots"],
			metadata: null
		},
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
		value: {
			data: [
				[800, 100, 800],
				[200, 800, 700]
			],
			headers: ["Math", "Reading", "Writing"],
			metadata: {
				styling: [
					[
						"background-color:teal; color: white",
						"1.2",
						"background-color:teal; color: white"
					],
					["1", "background-color:teal; color: white", "1.21"]
				]
			}
		},
		label: "Test scores",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		editable: false
	}}
/>

<Story
	name="Dataframe with column widths"
	args={{
		value: {
			data: [
				[800, 100, 800],
				[200, 800, 700]
			],
			headers: ["Narrow", "Wide", "Half"]
		},
		label: "Test scores",
		col_count: [3, "dynamic"],
		row_count: [2, "dynamic"],
		column_widths: ["20%", "30%", "50%"],
		editable: false
	}}
/>
