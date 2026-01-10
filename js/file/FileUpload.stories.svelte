<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import File from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/FileUpload",
		component: File,
		argTypes: {
			value: {
				control: "text",
				description: "The URL or filepath (or list of URLs or filepaths)",
				name: "value",
				value: []
			},
			file_count: {
				control: "radio",
				options: ["single", "multiple"],
				description: "Whether to allow single or multiple files to be uploaded",
				name: "file_count",
				value: "single"
			}
		}
	});
</script>

{#snippet template(args)}
	<File {...wrapProps(args)} />
{/snippet}

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
		],
		file_count: "single",
		interactive: true
	}}
	{template}
/>
<Story
	name="Multiple files"
	args={{
		value: [
			{
				path: "cheetah1.jpg",
				orig_name: "cheetah1.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				size: 10000
			},
			{
				path: "cheetah2.jpg",
				orig_name: "cheetah2.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
				size: 10000
			}
		],
		file_count: "multiple",
		interactive: true
	}}
	{template}
/>
<Story
	name="No value"
	args={{ value: null, file_count: "multiple", interactive: true }}
	{template}
/>
