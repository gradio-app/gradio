<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Number from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Number",
		component: Number,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			minimum: { control: "number", description: "Minimum value" },
			maximum: { control: "number", description: "Maximum value" },
			step: { control: "number", description: "Step increment" },
			interactive: { control: "boolean", description: "Whether interactive" },
			show_label: { control: "boolean", description: "Whether to show label" }
		}
	});
</script>

<Story name="Number with min 0 and max 100" args={{ minimum: 0, maximum: 100, interactive: true }}>
	{#snippet template(args)}
		<Number {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Number with step of 10" args={{ step: 10, interactive: true }}>
	{#snippet template(args)}
		<Number {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Number in disabled state" args={{ interactive: false }}>
	{#snippet template(args)}
		<Number {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Number with hidden label" args={{ show_label: false, interactive: true }}>
	{#snippet template(args)}
		<Number {...wrapProps(args)} />
	{/snippet}
</Story>
