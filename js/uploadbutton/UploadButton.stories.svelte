<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import UploadButton from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/UploadButton",
		component: UploadButton,
		argTypes: {
			label: {
				control: "text",
				description: "The text to display on the button",
				name: "label",
				value: "Gradio Button"
			},
			variant: {
				options: ["primary", "secondary", "stop"],
				description: "The variant of the button",
				control: { type: "select" },
				defaultValue: "primary"
			},
			size: {
				options: ["sm", "lg"],
				description: "The size of the button",
				control: { type: "select" },
				defaultValue: "lg"
			},
			visible: {
				options: [true, false],
				description: "Sets the visibility of the button",
				control: { type: "boolean" },
				defaultValue: true
			},
			interactive: {
				options: [true, false],
				description: "If false, the button will be in a disabled state",
				control: { type: "boolean" },
				defaultValue: true
			},
			disabled: {
				options: [true, false],
				control: { type: "boolean" },
				defaultValue: false
			},
			scale: {
				options: [null, 0.5, 1, 2],
				description: "relative size compared to adjacent Components.",
				control: { type: "select" }
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{ label: "Upload", variant: "primary", size: "lg", scale: 1 }}
>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>

<Story
	name="Secondary"
	args={{ label: "Upload", variant: "secondary", size: "lg" }}
>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>

<Story name="Stop" args={{ label: "Upload", variant: "stop", size: "lg" }}>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>

<Story
	name="Button with external image icon"
	args={{
		label: "Upload",
		icon: {
			path: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
			url: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
		}
	}}
>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>

<Story
	name="Button with visible equal to false"
	args={{ label: "Upload", visible: false }}
>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>

<Story
	name="Button with null label (should be collapsed)"
	args={{ label: null }}
>
	{#snippet template(args)}
		<UploadButton {...wrapProps({ value: "Gradio Button", ...args })} />
	{/snippet}
</Story>
