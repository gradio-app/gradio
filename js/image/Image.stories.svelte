<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import StaticImage from "./Index.svelte";
	import { userEvent, within } from "@storybook/test";
	import { allModes } from "../storybook/modes";
	import image_file_100x100 from "../storybook/test_files/image_100x100.webp";
	import image_file_100x1000 from "../storybook/test_files/image_100x100.webp";

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
		show_download_button: true,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const expand_btn = canvas.getByRole("button", {
			name: "Fullscreen"
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
		show_download_button: false,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="static with a vertically long image"
	args={{
		value: {
			path: image_file_100x1000,
			url: image_file_100x1000,
			orig_name: "image.webp"
		},
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="static with a vertically long image and a fixed height"
	args={{
		value: {
			path: image_file_100x1000,
			url: image_file_100x1000,
			orig_name: "image.webp"
		},
		height: "500px",
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="static with a small image and a fixed height"
	args={{
		value: {
			path: image_file_100x100,
			url: image_file_100x100,
			orig_name: "image.webp"
		},
		height: "500px",
		webcam_options: {
			mirror: true,
			constraints: null
		}
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
		placeholder: md,
		webcam_options: {
			mirror: true,
			constraints: null
		}
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
		interactive: true,
		webcam_options: {
			mirror: true,
			constraints: null
		}
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
		streaming: true,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>
