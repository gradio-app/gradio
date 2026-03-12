<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import File from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const cheetah = "/cheetah.jpg";
	const lion = "/lion.jpg";

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
				path: cheetah,
				orig_name: "cheetah.jpg",
				url: cheetah,
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
				path: cheetah,
				orig_name: "cheetah.jpg",
				url: cheetah,
				size: 10000
			},
			{
				path: lion,
				orig_name: "lion.jpg",
				url: lion,
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
