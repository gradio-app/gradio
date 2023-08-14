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
	name="Default"
	args={{
		value: [
			{
				name: "groot.jpg",
				data: "https://i.ibb.co/6BgKdSj/groot.jpg",
				size: 10000
			}
		]
	}}
/>
<Story
	name="With height set to 80px"
	args={{
		value: Array(10).fill({
			name: "groot.jpg",
			data: "https://i.ibb.co/6BgKdSj/groot.jpg",
			size: 10000
		}),
		height: 80
	}}
/>
