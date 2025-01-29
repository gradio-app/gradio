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
		canvas_size: [800, 600],
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

<Story
	name="Image Editor Cropping Interaction"
	args={{
		value: {
			background: {
				path: "",
				url: "/cheetah.jpg",
				size: null,
				orig_name: null,
				mime_type: null,
				is_stream: false,
				meta: {
					_type: "gradio.FileData"
				}
			},
			layers: [],
			composite: null,
			id: null
		},
		type: "pil",
		sources: ["upload", "webcam"],
		interactive: "true",
		canvas_size: [800, 800],
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

		canvas.getByLabelText("Show Layers").click();
		await new Promise((r) => setTimeout(r, 300));

		canvas.getByLabelText("layer-1").click();
		await new Promise((r) => setTimeout(r, 300));

		await userEvent.click(canvas.getByLabelText("Transform button"));
		await new Promise((r) => setTimeout(r, 300));
		const right_crop_handle =
			document.getElementsByClassName("handle corner r")[0];
		const rect = right_crop_handle.getBoundingClientRect();

		await userEvent.pointer({
			keys: "[MouseLeft>]",
			target: right_crop_handle
		});
		await new Promise((r) => setTimeout(r, 100));
		await userEvent.pointer({
			target: right_crop_handle,
			coords: { clientX: 100, clientY: rect.y }
		});
		await userEvent.pointer({
			target: right_crop_handle,
			keys: "[MouseLeft>]",
			coords: { clientX: 100, clientY: rect.y }
		});
		await new Promise((r) => setTimeout(r, 100));

		await userEvent.click(canvas.getByLabelText("Draw button"));
		await new Promise((r) => setTimeout(r, 100));
		await userEvent.click(canvas.getByLabelText("Draw button"));
	}}
/>

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
		canvas_size: [800, 800],
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
