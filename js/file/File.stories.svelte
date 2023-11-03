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
				path: "groot.jpg",
				orig_name: "groot.jpg",
				url: "https://i.ibb.co/6BgKdSj/groot.jpg",
				size: 10000
			}
		]
	}}
/>
<Story
	name="Multiple files, with height set to 150px"
	args={{
		value: Array(10).fill({
			path: "groot.jpg",
			orig_name: "groot.jpg",
			url: "https://i.ibb.co/6BgKdSj/groot.jpg",
			size: 10000
		}),
		height: 150
	}}
/>
