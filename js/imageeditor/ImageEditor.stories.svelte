<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
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
