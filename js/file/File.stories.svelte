<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import FilePreview from "./shared/FilePreview.svelte";
</script>

<Meta
	title="Components/File"
	component={FilePreview}
	argTypes={{
		value: {
			control: "text",
			description: "The URL or filepath (or list of URLs or filepaths)",
			name: "value",
			value: []
		}
	}}
/>

<Template let:args>
	<FilePreview {...args} />
</Template>

<Story
	name="Single File"
	args={{
		value: [
			{
				path: "cheetah.jpg",
				orig_name: "cheetah.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				size: 10000
			}
		]
	}}
/>
<Story
	name="Multiple files, with height set to 150px and reordering enabled"
	args={{
		value: [
			{
				path: "cheetah.jpg",
				orig_name: "cheetah.jpgz",
				url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
				size: 10000
			},
			{
				path: "cheetah.jpgs",
				orig_name: "cheetah.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				size: 10000
			}
		],
		height: 150,
		allow_reordering: true
	}}
/>
