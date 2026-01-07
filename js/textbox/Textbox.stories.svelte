<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Textbox from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Textbox",
		component: Textbox,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			label: { control: "text", description: "The textbox label" },
			show_label: {
				control: "boolean",
				description: "Whether to show the label",
				defaultValue: true
			},
			type: {
				control: "select",
				options: ["text", "email", "password"],
				description: "The type of textbox"
			},
			text_align: {
				control: "select",
				options: ["left", "right"],
				description: "Text alignment"
			},
			lines: {
				control: "select",
				options: [1, 5, 10, 20],
				description: "Number of lines"
			},
			max_lines: {
				control: "select",
				options: [1, 5, 10, 20],
				description: "Max lines"
			},
			rtl: { control: "boolean", description: "Right-to-left" }
		}
	});
</script>

<Story
	name="Textbox with label"
	args={{
		label: "My simple label",
		show_label: true,
		value: "hello world",
		interactive: true
	}}
>
	{#snippet template(args)}
		<Textbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Textbox with 5 lines and max 5 lines"
	args={{ lines: 5, max_lines: 5, value: "hello world", interactive: true }}
>
	{#snippet template(args)}
		<Textbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Password input"
	args={{
		type: "password",
		lines: 1,
		max_lines: 1,
		value: "secret",
		interactive: true
	}}
>
	{#snippet template(args)}
		<Textbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Right aligned textbox"
	args={{ text_align: "right", value: "hello world", interactive: true }}
>
	{#snippet template(args)}
		<Textbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="RTL textbox"
	args={{ rtl: true, value: "hello world", interactive: true }}
>
	{#snippet template(args)}
		<Textbox {...wrapProps(args)} />
	{/snippet}
</Story>
