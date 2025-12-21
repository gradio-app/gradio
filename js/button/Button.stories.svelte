<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Button from "./shared/Button.svelte";

	export const meta = {
		title: "Components/Button",
		component: Button,
		argTypes: {
			value: {
				control: "text",
				description: "The text to display on the button"
			},
			variant: {
				options: ["primary", "secondary", "stop", "huggingface"],
				description: "The variant of the button",
				control: { type: "select" }
			},
			size: {
				options: ["sm", "md", "lg"],
				description: "The size of the button",
				control: { type: "select" }
			},
			visible: {
				description: "Sets the visibility of the button",
				control: { type: "boolean" }
			},
			disabled: {
				description: "If true, the button will be in a disabled state",
				control: { type: "boolean" }
			},
			scale: {
				options: [null, 0.5, 1, 2],
				description: "Relative size compared to adjacent components",
				control: { type: "select" }
			},
			link: {
				control: "text",
				description: "URL to navigate to when clicked"
			}
		}
	};
</script>

<Template let:args>
	<Button {...args}>{args.value || "Gradio Button"}</Button>
</Template>

<Story
	name="Primary"
	args={{ variant: "primary", size: "lg", value: "Primary Button" }}
/>

<Story
	name="Secondary"
	args={{ variant: "secondary", size: "lg", value: "Secondary Button" }}
/>

<Story
	name="Stop"
	args={{ variant: "stop", size: "lg", value: "Stop Button" }}
/>

<Story
	name="Small"
	args={{ variant: "primary", size: "sm", value: "Small Button" }}
/>

<Story
	name="Medium"
	args={{ variant: "primary", size: "md", value: "Medium Button" }}
/>

<Story
	name="Disabled"
	args={{ variant: "primary", size: "lg", value: "Disabled Button", disabled: true }}
/>

<Story
	name="Button with link"
	args={{
		variant: "primary",
		size: "lg",
		value: "Link Button",
		link: "https://huggingface.co"
	}}
/>

<Story
	name="Huggingface variant"
	args={{ variant: "huggingface", size: "lg", value: "Huggingface Button" }}
/>

<Story
	name="Hidden"
	args={{ variant: "primary", value: "Hidden Button", visible: false }}
/>
