<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import File from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/File",
		component: File,
		argTypes: {
			value: {
				control: "text",
				description: "The URL or filepath (or list of URLs or filepaths)",
				name: "value",
				value: []
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
		]
	}}
	{template}
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
	{template}
/>
<Story
	name="File upload with height set to 400px"
	args={{ interactive: true, value: null, height: 400 }}
	{template}
/>
