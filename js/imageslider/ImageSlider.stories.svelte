<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { userEvent, within } from "storybook/test";
	import ImageSlider from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const cheetah = "/cheetah.jpg";
	const lion = "/lion.jpg";
	const fileData = (url, name) => ({
		path: url,
		url,
		orig_name: name,
		size: null,
		mime_type: "image/jpeg",
		is_stream: false,
		meta: { _type: "gradio.FileData" }
	});

	const { Story } = defineMeta({
		title: "Components/Image Slider",
		component: ImageSlider,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	});
</script>

<Story
	name="Mobile fullscreen"
	args={{
		value: [fileData(cheetah, "cheetah.jpg"), fileData(lion, "lion.jpg")],
		interactive: false,
		show_label: true,
		label: "Fullscreen comparison",
		buttons: ["fullscreen"],
		slider_position: 50,
		upload_count: 2,
		slider_color: "#ff8c00",
		max_height: 500
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Fullscreen" }));
	}}
>
	{#snippet template(args)}
		<div style="width: 360px; height: 440px; position: relative;">
			<ImageSlider {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>
