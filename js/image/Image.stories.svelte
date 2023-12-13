<script lang="ts">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import StaticImage from "./Index.svelte";
	import { userEvent, within } from "@storybook/testing-library";
</script>

<Meta
	title="Components/Image"
	component={Image}
	argTypes={{
		value: {
			control: "object",
			description: "The image URL or file to display",
			name: "value"
		},
		show_download_button: {
			options: [true, false],
			description: "If false, the download button will not be visible",
			control: { type: "boolean" },
			defaultValue: true
		}
	}}
/>

<Template let:args>
	<div
		class="image-container"
		style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
	>
		<StaticImage {...args} />
	</div>
</Template>

<Story
	name="Static Image with label and download button"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		show_label: true,
		show_download_button: true
	}}
/>

<Story
	name="Static Image with no label or download button"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		show_label: false,
		show_download_button: false
	}}
/>

<Story
	name="Interactive Image with source selection"
	args={{
		sources: ["upload", "clipboard", "webcam"],
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		show_label: false,
		show_download_button: false,
		interactive: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const webcamButton = await canvas.findByLabelText("Capture from camera");

		userEvent.click(webcamButton);
	}}
/>
