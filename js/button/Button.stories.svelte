<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Button from "./shared/Button.svelte";

	const { Story } = defineMeta({
		title: "Components/Button",
		component: Button,
		tags: ["autodocs"],
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
	});
</script>

<Story name="Primary" args={{ variant: "primary", size: "lg", value: "Primary Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: "secondary", size: "lg", value: "Secondary Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Stop" args={{ variant: "stop", size: "lg", value: "Stop Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: "primary", size: "sm", value: "Small Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Medium" args={{ variant: "primary", size: "md", value: "Medium Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: "primary", size: "lg", disabled: true, value: "Disabled Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Button with link" args={{ variant: "primary", size: "lg", link: "https://huggingface.co", value: "Link Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Huggingface variant" args={{ variant: "huggingface", size: "lg", value: "Huggingface Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>

<Story name="Hidden" args={{ variant: "primary", visible: false, value: "Hidden Button" }}>
	{#snippet template(args)}
		<Button {...args}>{args.value}</Button>
	{/snippet}
</Story>
