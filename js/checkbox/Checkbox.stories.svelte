<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Checkbox from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Checkbox",
		component: Checkbox,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			label: {
				control: "text",
				description: "The checkbox label",
				name: "label"
			},
			info: {
				control: "text",
				description: "Additional info text",
				name: "info"
			},
			show_label: {
				options: [true, false],
				description: "Whether to show the label",
				control: { type: "boolean" },
				defaultValue: true
			},
			value: {
				options: [true, false],
				description: "Whether the checkbox is checked",
				control: { type: "boolean" },
				defaultValue: false
			},
			interactive: {
				options: [true, false],
				description: "Whether the checkbox is interactive",
				control: { type: "boolean" },
				defaultValue: true
			}
		}
	});
</script>

<Story
	name="Checkbox with label"
	args={{
		value: false,
		interactive: true,
		label: "Accept terms and conditions",
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Checkbox with info"
	args={{
		value: false,
		interactive: true,
		info: "You must accept to continue",
		show_label: false
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Checkbox without label or info"
	args={{
		value: false,
		interactive: true,
		label: "Hidden label",
		show_label: false
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Checkbox with label and info"
	args={{
		value: false,
		interactive: true,
		label: "Accept terms and conditions",
		info: "You must accept to continue",
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Checkbox checked"
	args={{
		value: true,
		interactive: true,
		label: "I agree to the terms",
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Checkbox disabled"
	args={{
		value: false,
		interactive: false,
		label: "Non-interactive checkbox",
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkbox {...wrapProps(args)} />
	{/snippet}
</Story>
