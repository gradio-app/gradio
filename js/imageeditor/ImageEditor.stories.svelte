<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { userEvent, within } from "storybook/test";
	import ImageEditor from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const cheetah = "/cheetah.jpg";

	const { Story } = defineMeta({
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
	});
</script>

<Story
	name="Default Image Editor"
	args={{
		sources: ["webcam", "upload"],
		type: "pil",
		interactive: true,
		label: "Image Editor",
		show_label: true,
		value: null,
		canvas_size: [800, 600],
		transforms: ["crop"],
		layers: { allow_additional_layers: true, layers: [] },
		brush: {
			default_size: "auto",
			colors: ["#ff0000", "#00ff00", "#0000ff"],
			default_color: "#ff0000",
			color_mode: "defaults"
		},
		eraser: {
			default_size: "auto"
		},
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 500px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<ImageEditor {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="Image Editor Undo/Redo Interactions"
	args={{
		value: {
			background: {
				path: cheetah,
				url: cheetah,
				orig_name: "cheetah.jpg"
			},
			layers: [],
			composite: null
		},
		type: "pil",
		placeholder: "Upload an image of a cat",
		sources: ["upload", "webcam"],
		canvas_size: [800, 800],
		interactive: true,
		transforms: ["crop"],
		layers: { allow_additional_layers: true, layers: [] },
		brush: {
			default_size: "auto",
			colors: ["#ff0000", "#00ff00", "#0000ff"],
			default_color: "#ff0000",
			color_mode: "defaults"
		},
		eraser: {
			default_size: "auto"
		},
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
	parameters={{ chromatic: { disableSnapshot: true } }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const drawButton = canvas.getAllByLabelText("Brush")[0];
		await userEvent.click(drawButton);

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
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 500px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<ImageEditor {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="Static Image Display"
	args={{
		value: {
			composite: {
				path: cheetah,
				url: cheetah,
				size: null,
				orig_name: null,
				mime_type: null,
				is_stream: false,
				meta: {
					_type: "gradio.FileData"
				}
			},
			layers: [],
			background: null,
			id: null
		},
		type: "pil",
		interactive: false,
		label: "Image Editor",
		show_label: true,
		canvas_size: [800, 600],
		transforms: [],
		layers: { allow_additional_layers: false, layers: [] },
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 500px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<ImageEditor {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>
