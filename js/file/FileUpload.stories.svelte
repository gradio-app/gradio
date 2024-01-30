<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import FileUpload from "./shared/FileUpload.svelte";

	//     export const meta = {
	//         title: "Components/FileUpload",
	//         component: FileUpload,
	//         argTypes: {
	//             value: {
	//                 control: "text",
	//                 description: "The URL or filepath (or list of URLs or filepaths)",
	//                 name: "value",
	//                 value: []
	//             },
	//             file_count: {
	//                 control: "radio",
	//                 options: ["single", "multiple"],
	//                 description: "Whether to allow single or multiple files to be uploaded",
	//                 name: "file_count",
	//                 value: "single"
	//             },
	//         }
	//   }
</script>

<Meta
	title="Components/FileUpload"
	component={FileUpload}
	argTypes={{
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
	}}
/>

<Template let:args>
	<FileUpload {...args} i18n={{ "file.uploading": "Uploading" }} />
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
		],
		file_count: "single"
	}}
/>
<Story
	name="Multiple files"
	args={{
		value: Array(2).fill({
			path: "cheetah.jpg",
			orig_name: "cheetah.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			size: 10000
		}),
		file_count: "multiple"
	}}
/>
<Story
	name="No value"
	args={{
		value: null,
		file_count: "multiple"
	}}
/>
