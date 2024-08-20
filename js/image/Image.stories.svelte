<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import StaticImage from "./Index.svelte";
	import { userEvent, within } from "@storybook/test";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Components/Image",
		component: StaticImage,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	};

	let md = `# a heading! /n a new line! `;
</script>

<Template let:args>
	<div
		class="image-container"
		style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
	>
		<StaticImage {...args} />
	</div>
</Template>

<Story
	name="static with label, info and download button"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		show_label: true,
		placeholder: "This is a cheetah",
		show_download_button: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const expand_btn = canvas.getByRole("button", {
			name: "View in full screen"
		});
		await userEvent.click(expand_btn);
	}}
/>

<Story
	name="static with no label or download button"
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
	name="interactive with upload, clipboard, and webcam"
	args={{
		sources: ["upload", "clipboard", "webcam"],
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		show_label: false,
		show_download_button: false,
		interactive: true,
		placeholder: md
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const webcamButton = await canvas.findByLabelText("Capture from camera");
		userEvent.click(webcamButton);

		userEvent.click(await canvas.findByTitle("grant webcam access"));
		userEvent.click(await canvas.findByLabelText("Upload file"));
		userEvent.click(await canvas.findByLabelText("Paste from clipboard"));
	}}
/>

<Story
	name="interactive with webcam"
	args={{
		sources: ["webcam"],
		show_download_button: true,
		interactive: true
	}}
/>

<Story
	name="interactive with clipboard"
	args={{
		sources: ["clipboard"],
		show_download_button: true,
		interactive: true
	}}
/>

<Story
	name="interactive webcam with streaming"
	args={{
		sources: ["webcam"],
		show_download_button: true,
		interactive: true,
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		streaming: true
	}}
/>
