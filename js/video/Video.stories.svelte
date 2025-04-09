<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Video from "./Index.svelte";
	import { format } from "svelte-i18n";
	import { get } from "svelte/store";
	import { userEvent, within } from "@storybook/test";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Components/Video",
		component: Video,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	};
</script>

<div>
	<Template let:args>
		<Video i18n={get(format)} {...args} />
	</Template>
</div>

<Story
	name="Record from webcam"
	args={{
		format: "mp4",
		label: "world video",
		show_label: true,
		interactive: true,
		height: 400,
		width: 400,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="Static video"
	args={{
		value: {
			video: {
				path: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				url: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				orig_name: "world.mp4"
			}
		},
		label: "world video",
		show_label: true,
		show_download_button: true,
		interactive: false,
		height: 200,
		width: 400,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>
<Story
	name="Static video with vertical video"
	args={{
		value: {
			video: {
				path: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world_vertical.mp4",
				url: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world_vertical.mp4",
				orig_name: "world_vertical.mp4"
			}
		},
		label: "world video",
		show_label: true,
		show_download_button: false,
		interactive: false,
		height: 200,
		width: 400,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="Upload video"
	args={{
		label: "world video",
		show_label: true,
		interactive: true,
		sources: ["upload", "webcam"],
		width: 400,
		height: 400,
		value: null,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="Upload video with download button"
	args={{
		label: "world video",
		show_label: true,
		interactive: true,
		sources: ["upload", "webcam"],
		show_download_button: true,
		width: 400,
		height: 400,
		value: {
			video: {
				path: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				url: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				orig_name: "world.mp4"
			}
		},
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
/>

<Story
	name="Trim video"
	args={{
		value: {
			video: {
				path: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				url: "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4",
				orig_name: "world.mp4"
			}
		},
		label: "world video",
		show_label: true,
		interactive: "true",
		sources: ["upload"],
		width: 400,
		webcam_options: {
			mirror: true,
			constraints: null
		}
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trimButton = canvas.getByLabelText("Trim video to selection");
		userEvent.click(trimButton);
	}}
/>
