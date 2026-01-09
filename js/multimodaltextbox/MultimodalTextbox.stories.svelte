<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import MultimodalTextbox from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/MultimodalTextbox",
		component: MultimodalTextbox,
		argTypes: {
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
		}
	});
</script>

{#snippet template(args)}
	<MultimodalTextbox {...wrapProps(args)} />
{/snippet}

<Story name="MultimodalTextbox with file and label" args={{ value: { text: "sample text", files: [{ path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg", url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg", orig_name: "cheetah.jpg" }] }, label: "My simple label", show_label: true, sources: ["upload", "microphone"], file_types: [], lines: 1, max_lines: 5 }} {template} />
<Story name="MultimodalTextbox with 5 lines and max 5 lines" args={{ lines: 5, max_lines: 5, sources: ["upload", "microphone"], file_types: [], value: { text: "", files: [] } }} {template} />
<Story name="Right aligned textbox" args={{ text_align: "right", sources: ["upload", "microphone"], file_types: [], lines: 1, max_lines: 5, value: { text: "", files: [] } }} {template} />
<Story name="Single file upload" args={{ file_count: "single", submit_btn: true, sources: ["upload"], file_types: [], lines: 1, max_lines: 5, value: { text: "sample text", files: [{ path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg", url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg", orig_name: "cheetah.jpg" }] } }} {template} />
<Story name="MultimodalTextbox with microphone input and right to left text" args={{ label: "مرحبًا", sources: ["microphone"], file_types: [], rtl: true, submit_btn: true, lines: 1, max_lines: 5, value: { text: "مرحبًا", files: [] } }} {template} />
