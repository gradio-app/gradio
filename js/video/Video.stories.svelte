<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Video from "./Index.svelte";
	import { format } from "svelte-i18n";
	import { get } from "svelte/store";
</script>

<Meta
	title="Components/Video"
	component={Video}
	argTypes={{
		video: {
			control: "text",
			description:
				"A path or URL for the default value that Video component is going to take. Can also be a tuple consisting of (video filepath, subtitle filepath). If a subtitle file is provided, it should be of type .srt or .vtt. Or can be callable, in which case the function will be called whenever the app loads to set the initial value of the component.",
			name: "value"
		},
		autoplay: {
			control: [true, false],
			description: "Whether to autoplay the video on load",
			name: "autoplay",
			value: true
		}
	}}
/>

<div>
	<Template let:args>
		<Video {...args} i18n={get(format)} />
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
		width: 400
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
		interactive: false,
		height: 200,
		width: 400
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
		value: null
	}}
/>
