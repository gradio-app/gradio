<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import StaticImage from "./static";
</script>

<Meta
	title="Components/Image"
	component={Image}
	argTypes={{
		value: {
			control: "text",
			description: "The image URL or file to display",
			name: "value",
			value: "https://i.ibb.co/6BgKdSj/groot.jpg"
		},
		show_download_button: {
			options: [true, false],
			description: "If false, the download button will not be visible",
			control: { type: "boolean" },
			defaultValue: true
		}
	}}
/>

<Template let:args>
	<div
		class="image-container"
		style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
	>
		<StaticImage {...args} />
	</div>
</Template>

<Story
	name="Static Image with label and download button"
	args={{
		value: "https://i.ibb.co/6BgKdSj/groot.jpg",
		show_label: true,
		show_download_button: true
	}}
/>

<Story
	name="Static Image with no label or download button"
	args={{
		value: "https://i.ibb.co/6BgKdSj/groot.jpg",
		show_label: false,
		show_download_button: false
	}}
/>
