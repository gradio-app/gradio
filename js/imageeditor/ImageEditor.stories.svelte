<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import ImageEditor from "./Index.svelte";
	import { format } from "svelte-i18n";
	import { get } from "svelte/store";
	import { userEvent, within } from "@storybook/test";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Components/Image Editor",
		component: ImageEditor,
		parameters: {
			chromatic: {
				diffThreshold: 0.4,
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	};
</script>

<Template let:args>
	<div
		class="image-container"
		style="width: 500px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
	>
		<ImageEditor
			i18n={get(format)}
			{...args}
			server={{ accept_blobs: () => {} }}
		/>
	</div>
</Template>

<Story
	name="Default Image Editor"
	args={{
		sources: ["webcam", "upload"],
		type: "pil",
		interactive: "true",
		label: "Image Editor",
		show_label: true,
		brush: {
			default_size: "auto",
			colors: ["#ff0000", "#00ff00", "#0000ff"],
			default_color: "#ff0000",
			color_mode: "defaults"
		},
		eraser: {
			default_size: "auto"
		}
	}}
/>

<!-- <Story
	name="Image Editor Drawing Interactions"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		type: "pil",
		sources: ["upload", "webcam"],
		interactive: "true",
		brush: {
			default_size: "auto",
			colors: ["#ff0000", "#00ff00", "#0000ff"],
			default_color: "#ff0000",
			color_mode: "defaults"
		},
		eraser: {
			default_size: "auto"
		}
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const drawButton = canvas.getAllByLabelText("Draw button")[0];

		userEvent.click(drawButton);

		const drawCanvas = document.getElementsByTagName("canvas")[0];
		if (!drawCanvas) {
			throw new Error("Could not find canvas");
		}

		await new Promise((r) => setTimeout(r, 1000));

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: drawCanvas,
			coords: { clientX: 300, clientY: 100 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: drawCanvas,
			coords: { clientX: 300, clientY: 100 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: drawCanvas,
			coords: { clientX: 300, clientY: 100 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 300, clientY: 300 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 300, clientY: 300 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 100, clientY: 100 }
		});

		await userEvent.click(canvas.getByLabelText("Draw button"));

		var availableColors = document.querySelectorAll(
			"button.color:not(.empty):not(.selected):not(.hidden)"
		);

		await userEvent.click(availableColors[0]);

		await userEvent.keyboard("{Escape}");

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: drawCanvas,
			coords: { clientX: 50, clientY: 50 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: drawCanvas,
			coords: { clientX: 100, clientY: 100 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 100, clientY: 300 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 300, clientY: 300 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 100, clientY: 100 }
		});

		await userEvent.click(canvas.getByLabelText("Transform button"));

		const bottomCropHandle =
			document.getElementsByClassName("handle corner b")[0];

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: bottomCropHandle,
			coords: { clientX: 1000, clientY: 200 }
		});

		await userEvent.pointer({
			target: bottomCropHandle,
			coords: { clientX: 500, clientY: 0 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: bottomCropHandle,
			coords: { clientX: 500, clientY: 0 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			coords: { clientX: 500, clientY: 0 }
		});

		await userEvent.pointer({
			target: drawCanvas,
			coords: { clientX: 100, clientY: 300 }
		});

		userEvent.tripleClick(drawCanvas);

		await new Promise((r) => setTimeout(r, 1000));

		userEvent.click(canvas.getByLabelText("Show Layers"));

		await new Promise((r) => setTimeout(r, 1000));

		userEvent.click(canvas.getByLabelText("Add Layer"));

		await userEvent.click(canvas.getByLabelText("Clear canvas"));
	}}
/> -->

<Story
	name="Image Editor Undo/Redo Interactions"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		},
		type: "pil",
		placeholder: "Upload an image of a cat",
		sources: ["upload", "webcam"],
		interactive: "true",
		brush: {
			default_size: "auto",
			colors: ["#ff0000", "#00ff00", "#0000ff"],
			default_color: "#ff0000",
			color_mode: "defaults"
		},
		eraser: {
			default_size: "auto"
		}
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const drawButton = canvas.getAllByLabelText("Draw button")[0];

		userEvent.click(drawButton);

		const drawCanvas = document.getElementsByTagName("canvas")[0];
		if (!drawCanvas) {
			throw new Error("Could not find canvas");
		}

		await new Promise((r) => setTimeout(r, 1000));

		await userEvent.pointer({
			keys: "[MouseLeft][MouseRight]",
			target: drawCanvas,
			coords: { clientX: 300, clientY: 100 }
		});

		await userEvent.pointer({
			keys: "[MouseLeft][MouseRight]",
			target: drawCanvas,
			coords: { clientX: 400, clientY: 200 }
		});

		await userEvent.click(canvas.getByLabelText("Undo"));

		await userEvent.click(canvas.getByLabelText("Redo"));
	}}
/>
