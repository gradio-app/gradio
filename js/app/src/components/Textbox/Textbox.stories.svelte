<script>
	import {Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Textbox from "./Textbox.svelte";
</script>

<Meta
	title="Components/Textbox"
	component={Textbox}
	argTypes={{
		label: {
			control: "text",
			description: "The gallery label",
			name: "label",
			value: "Gradio Button"
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
			description: "The number of lines to show in the textbox",
			control: { type: "select" },
			defaultValue: 1
		},
	}}
/>


<Template let:args>
	<Textbox
		{...args}
		value="hello world"
	/>
</Template>

<Story
	name="Textbox with label"
	args={{ label: "My simple label", show_label: true }}
/>
<Story
	name="Textbox with lines specified"
	args={{ lines: 10 }}
/>
<Story
	name="Password input"
	args={{ type: "password" }}
/>
<Story
	name="Right aligned textbox"
	args={{ text_align: "right" }}
/>

