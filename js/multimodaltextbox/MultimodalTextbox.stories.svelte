<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import MultimodalTextbox from "./Index.svelte";
</script>

<Meta
	title="Components/MultimodalTextbox"
	component={MultimodalTextbox}
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
		sources: {
			options: ["upload", "microphone"],
			description: "The sources to enable",
			control: { type: "select" },
			defaultValue: ["upload", "microphone"]
		}
	}}
/>

<Template let:args>
	<MultimodalTextbox {...args} />
</Template>

<Story
	name="MultimodalTextbox with file and label"
	args={{
		value: {
			text: "sample text",
			files: [
				{
					path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
					url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
					orig_name: "cheetah.jpg"
				}
			]
		},
		label: "My simple label",
		show_label: true
	}}
/>
<Story
	name="MultimodalTextbox with 5 lines and max 5 lines"
	args={{ lines: 5, max_lines: 5 }}
/>
<Story name="Right aligned textbox" args={{ text_align: "right" }} />
<Story
	name="Single file upload"
	args={{
		file_count: "single",
		submit_btn: true,
		value: {
			text: "sample text",
			files: [
				{
					path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg"
				}
			]
		}
	}}
/>
<Story
	name="MultimodalTextbox with microphone input and right to left text"
	args={{
		label: "مرحبًا",
		sources: ["microphone"],
		rtl: true,
		submit_btn: true,
		value: { text: "مرحبًا", files: [] }
	}}
/>
