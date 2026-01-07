<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import StandaloneDataframe from "./standalone/Index.svelte";

	const { Story } = defineMeta({
		title: "Components/Standalone Dataframe (Interim)",
		component: StandaloneDataframe,
		parameters: {
			test: {
				dangerouslyIgnoreUnhandledErrors: true
			},
			docs: {
				description: {
					component:
						"Standalone DataFrame component that can be used independently outside of Gradio apps. Includes comprehensive CSS variables for theming and dark mode support. Use the dark mode toggle in the toolbar to test dark mode variables."
				}
			}
		},
		argTypes: {
			interactive: {
				control: "boolean",
				description: "Whether the DataFrame is editable",
				defaultValue: true
			},
			show_label: {
				control: "boolean",
				description: "Whether to show the label",
				defaultValue: true
			},
			label: {
				control: "text",
				description: "Label for the DataFrame",
				defaultValue: "DataFrame"
			},
			max_height: {
				control: "number",
				description: "Maximum height in pixels",
				defaultValue: 500
			},
			show_search: {
				control: "select",
				options: ["none", "search", "filter"],
				description: "Type of search/filter to show",
				defaultValue: "none"
			},
			show_copy_button: {
				control: "boolean",
				description: "Whether to show the copy button",
				defaultValue: false
			},
			show_fullscreen_button: {
				control: "boolean",
				description: "Whether to show the fullscreen button",
				defaultValue: false
			},
			show_row_numbers: {
				control: "boolean",
				description: "Whether to show row numbers",
				defaultValue: false
			},
			wrap: {
				control: "boolean",
				description: "Whether text should wrap or truncate with ellipsis",
				defaultValue: false
			}
		}
	});
</script>

<Story name="Basic Standalone" args={{
	value: {
		data: [
			["Alice Johnson", 28, "Engineer", 75000, true],
			["Bob Smith", 35, "Designer", 65000, false],
			["Carol Wilson", 42, "Manager", 85000, true],
			["David Brown", 31, "Developer", 70000, true],
			["Eva Davis", 29, "Analyst", 60000, false]
		],
		headers: ["Name", "Age", "Role", "Salary", "Remote"],
		metadata: null
	},
	datatype: ["str", "number", "str", "number", "bool"],
	interactive: true,
	show_label: true,
	label: "Employee Data",
	max_height: 400,
	show_search: "search",
	show_copy_button: true,
	show_fullscreen_button: true
}}>
	{#snippet template(args)}
		<div class="standalone-container">
			<StandaloneDataframe {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Large Dataset Performance" args={{
	value: {
		data: Array.from({ length: 100 }, (_, i) => [
			`User ${i + 1}`,
			Math.floor(Math.random() * 50) + 20,
			["Engineer", "Designer", "Manager", "Developer", "Analyst"][
				Math.floor(Math.random() * 5)
			],
			Math.floor(Math.random() * 50000) + 50000,
			Math.random() > 0.5,
			`City ${Math.floor(Math.random() * 20) + 1}`,
			Math.floor(Math.random() * 100)
		]),
		headers: ["Name", "Age", "Role", "Salary", "Remote", "Location", "Score"],
		metadata: null
	},
	datatype: ["str", "number", "str", "number", "bool", "str", "number"],
	interactive: false,
	show_label: true,
	label: "Large Dataset (100 rows)",
	max_height: 400,
	show_row_numbers: true,
	column_widths: ["120px", "60px", "100px", "80px", "70px", "100px", "70px"]
}}>
	{#snippet template(args)}
		<div class="standalone-container">
			<StandaloneDataframe {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Styled with Custom Colors" args={{
	value: {
		data: [
			[95, 87, 92],
			[78, 94, 89],
			[88, 91, 85],
			[92, 76, 94]
		],
		headers: ["Math", "Science", "English"],
		metadata: {
			styling: [
				[
					"background-color: #dcfce7; color: #166534;",
					"",
					"background-color: #dbeafe; color: #1e40af;"
				],
				["", "background-color: #dcfce7; color: #166534;", ""],
				[
					"background-color: #fef3c7; color: #92400e;",
					"",
					"background-color: #fef3c7; color: #92400e;"
				],
				[
					"background-color: #dcfce7; color: #166534;",
					"",
					"background-color: #dcfce7; color: #166534;"
				]
			]
		}
	},
	datatype: ["number", "number", "number"],
	interactive: false,
	show_label: true,
	label: "Test Scores with Custom Styling",
	max_height: 250,
	show_row_numbers: true
}}>
	{#snippet template(args)}
		<div class="standalone-container">
			<StandaloneDataframe {...args} />
		</div>
	{/snippet}
</Story>
