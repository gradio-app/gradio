<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
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
	<Table {...args} />
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
		values: {
			data: [
				[1.24, 1.24, 1.24],
				[1.21, 1.21, 1.21]
			],
			metadata: {
				display_value: [
					["1", "1.2", "1.24"],
					["1", "1.2", "1.21"]
				]
			}
		},
		headers: ["Precision=0", "Precision=1", "Precision=2"],
		label: "Animals",
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
	name="Empty dataframe"
	args={{
		values: [[]],
		headers: ["Animal", "Votes"],
		label: "Animals",
		col_count: [2, "dynamic"],
		row_count: [0, "dynamic"]
	}}
/>
