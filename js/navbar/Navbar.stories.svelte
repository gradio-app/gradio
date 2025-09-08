<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Navbar from "./Index.svelte";
</script>

<Meta
	title="Components/Navbar"
	component={Navbar}
	argTypes={{
		visible: {
			options: [true, false],
			description: "Sets the visibility of the navbar",
			control: { type: "boolean" },
			defaultValue: true
		},
		home_page_title: {
			control: "text",
			description: "The title to display for the home page in the navbar",
			name: "home_page_title",
			value: "Home"
		},
		elem_id: {
			control: "text",
			description:
				"An optional string that is assigned as the id of this component",
			name: "elem_id"
		},
		elem_classes: {
			control: "object",
			description:
				"An optional list of strings that are assigned as the classes of this component",
			name: "elem_classes",
			value: []
		}
	}}
/>

<Template let:args>
	<Navbar {...args} />
</Template>

<Story
	name="Default"
	args={{
		visible: true,
		home_page_title: "Home"
	}}
/>

<Story
	name="Custom Home Title"
	args={{
		visible: true,
		home_page_title: "Dashboard"
	}}
/>

<Story
	name="Hidden Navbar"
	args={{
		visible: false,
		home_page_title: "Home"
	}}
/>
