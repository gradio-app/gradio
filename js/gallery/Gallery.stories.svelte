<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Gallery from "./static/";
</script>

<Meta
	title="Components/Gallery"
	component={Gallery}
	argTypes={{
		label: {
			control: "text",
			description: "The gallery label",
			name: "label",
			value: "Gradio Button"
		},
		show_label: {
			options: [true, false],
			description: "Whether to show the label",
			control: { type: "boolean" },
			defaultValue: true
		},
		columns: {
			options: [1, 2, 3, 4],
			description: "The number of columns to show in grid",
			control: { type: "select" },
			defaultValue: 2
		},
		rows: {
			options: [1, 2, 3, 4],
			description: "The number of rows to show in grid",
			control: { type: "select" },
			defaultValue: 2
		},
		height: {
			options: ["auto", 500, 600],
			description: "The height of the grid",
			control: { type: "select" },
			defaultValue: "auto"
		},
		preview: {
			options: [true, false],
			description: "Whether to start the gallery in preview mode",
			control: { type: "boolean" },
			defaultValue: true
		},
		allow_preview: {
			options: [true, false],
			description: "Whether to allow a preview mode in the gallery",
			control: { type: "boolean" },
			defaultValue: true
		},
		object_fit: {
			options: ["contain", "cover", "fill", "none", "scale-down"],
			description: "How to display each indivial image in the grid",
			control: { type: "select" },
			defaultValue: "contain"
		},
		show_share_button: {
			options: [true, false],
			description: "Whether to show the share button in the gallery",
			control: { type: "boolean" },
			defaultValue: false
		}
	}}
/>

<Template let:args>
	<Gallery
		value={[
			[
				"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah_running.avif",
				"A fast cheetah"
			],
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp",
			"https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/TheCheethcat.jpg"
		]}
		{...args}
	/>
</Template>

<Story
	name="Gallery with label"
	args={{ label: "My Cheetah Gallery", show_label: true }}
/>
<Story
	name="Gallery without label"
	args={{ label: "My Cheetah Gallery", show_label: false }}
/>
<Story
	name="Gallery with rows=3 and columns=3"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		rows: 3,
		columns: 3
	}}
/>
<Story
	name="Gallery with columns=4"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		columns: 4
	}}
/>
<Story
	name="Gallery with height=600"
	args={{
		label: "My Cheetah Gallery",
		height: 600
	}}
/>
<Story
	name="Gallery with allow_preview=false"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		allow_preview: false
	}}
/>
<Story
	name="Gallery with preview"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		preview: true
	}}
/>
<Story
	name="Gallery with object_fit=scale-down"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "scale-down"
	}}
/>
<Story
	name="Gallery with object_fit=contain"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "contain"
	}}
/>
<Story
	name="Gallery with object_fit=cover"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "cover"
	}}
/>
<Story
	name="Gallery with object_fit=none"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "none"
	}}
/>
<Story
	name="Gallery with object_fit=fill"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "fill"
	}}
/>
<Story
	name="Gallery with share button"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		show_share_button: true
	}}
/>

<Story
	name="Gallery with overflow of images"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		rows: 2,
		columns: 2,
		height: 400,
		value: [
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			"https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg"
		]
	}}
/>

<Story
	name="Gallery with download button"
	args={{
		label: "My Cheetah Gallery",
		rows: 2,
		height: 400,
		show_download_button: true,
		value: ["https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg"]
	}}
/>
