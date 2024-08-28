<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Textbox from "./Index.svelte";
</script>

<Meta
	title="Components/Textbox"
	component={Textbox}
	argTypes={{
		label: {
			control: "text",
			description: "The textbox label",
			name: "label"
		},
		show_label: {
			options: [true, false],
			description: "Whether to show the label",
			control: { type: "boolean" },
			defaultValue: true
		},
		type: {
			options: ["text", "email", "password"],
			description: "The type of textbox",
			control: { type: "select" },
			defaultValue: "text"
		},
		text_align: {
			options: ["left", "right"],
			description: "Whether to align the text left or right",
			control: { type: "select" },
			defaultValue: "left"
		},
		lines: {
			options: [1, 5, 10, 20],
			description: "The number of lines to display in the textbox",
			control: { type: "select" },
			defaultValue: 1
		},
		max_lines: {
			options: [1, 5, 10, 20],
			description:
				"The maximum number of lines to allow users to type in the textbox",
			control: { type: "select" },
			defaultValue: 1
		},
		rtl: {
			options: [true, false],
			description: "Whether to render right-to-left",
			control: { type: "boolean" },
			defaultValue: false
		},
		max_length: {
			description: "The maximum number of characters allowed in the textbox",
			control: { type: "number" }
		}
	}}
/>

<Template let:args>
	<Textbox {...args} value="hello world" />
</Template>

<Story
	name="Textbox with label"
	args={{ label: "My simple label", show_label: true }}
/>
<Story
	name="Textbox with 5 lines and max 5 lines"
	args={{ lines: 5, max_lines: 5 }}
/>
<Story
	name="Password input"
	args={{ type: "password", lines: 1, max_lines: 1 }}
/>
<Story name="Right aligned textbox" args={{ text_align: "right" }} />
<Story name="RTL textbox" args={{ rtl: true }} />
