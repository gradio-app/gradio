<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import StaticImage from "./Index.svelte";
	import { userEvent, within } from "storybook/test";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	// Test image URLs
	const image_file_100x100 =
		"https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg";
	const image_file_100x1000 =
		"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp";

	const { Story } = defineMeta({
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
	});

	let md = `# a heading! /n a new line! `;
</script>

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
		buttons: ["fullscreen", "download"],
		webcam_options: { mirror: true, constraints: null }
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const expand_btn = canvas.getByRole("button", { name: "Fullscreen" });
		await userEvent.click(expand_btn);
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

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
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a vertically long image"
	args={{
		value: {
			path: image_file_100x1000,
			url: image_file_100x1000,
			orig_name: "image.webp"
		},
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a vertically long image and a fixed height"
	args={{
		value: {
			path: image_file_100x1000,
			url: image_file_100x1000,
			orig_name: "image.webp"
		},
		height: "500px",
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a small image and a fixed height"
	args={{
		value: {
			path: image_file_100x100,
			url: image_file_100x100,
			orig_name: "image.webp"
		},
		height: "500px",
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

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
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
	parameters={{ chromatic: { disableSnapshot: true } }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const webcamButton = await canvas.findByLabelText("Capture from camera");
		userEvent.click(webcamButton);
		userEvent.click(await canvas.findByTitle("grant webcam access"));
		userEvent.click(await canvas.findByLabelText("Upload file"));
		userEvent.click(await canvas.findByLabelText("Paste from clipboard"));
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="interactive with webcam"
	args={{
		sources: ["webcam"],
		show_download_button: true,
		interactive: true,
		buttons: ["download"],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="interactive with clipboard"
	args={{
		sources: ["clipboard"],
		show_download_button: true,
		interactive: true,
		buttons: ["download"]
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

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
		buttons: ["download"],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>
