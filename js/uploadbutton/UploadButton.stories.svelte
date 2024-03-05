<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import UploadButton from "./Index.svelte";
</script>

<Meta
	title="Components/UploadButton"
	component={UploadButton}
	argTypes={{
		label: {
			control: "text",
			description: "The text to display on the button",
			name: "label",
			value: "Gradio Button"
		},
		variant: {
			options: ["primary", "secondary", "stop"],
			description: "The variant of the button",
			control: { type: "select" },
			defaultValue: "primary"
		},
		size: {
			options: ["sm", "lg"],
			description: "The size of the button",
			control: { type: "select" },
			defaultValue: "lg"
		},
		visible: {
			options: [true, false],
			description: "Sets the visibility of the button",
			control: { type: "boolean" },
			defaultValue: true
		},
		interactive: {
			options: [true, false],
			description: "If false, the button will be in a disabled state",
			control: { type: "boolean" },
			defaultValue: true
		},
		disabled: {
			options: [true, false],
			control: { type: "boolean" },
			defaultValue: false
		},
		scale: {
			options: [null, 0.5, 1, 2],
			description:
				"relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. Only applies in Rows, or top-level Components in Blocks where fill_height=True. ",
			control: { type: "select" }
		}
	}}
/>

<Template let:args>
	<UploadButton value="Gradio Button" {...args} />
</Template>

<Story
	name="Primary"
	args={{ label: "Upload", variant: "primary", size: "lg", scale: 1 }}
/>
<Story
	name="Secondary"
	args={{ label: "Upload", variant: "secondary", size: "lg" }}
/>
<Story name="Stop" args={{ label: "Upload", variant: "stop", size: "lg" }} />
<Story
	name="Button with external image icon"
	args={{
		label: "Upload",
		icon: {
			path: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
			url: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
		}
	}}
/>
<Story
	name="Button with visible equal to false"
	args={{
		label: "Upload",
		visible: false
	}}
/>
<Story
	name="Button with null label (should be collapsed)"
	args={{
		label: null
	}}
/>
