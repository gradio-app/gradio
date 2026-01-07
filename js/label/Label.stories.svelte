<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Label from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Label",
		component: Label,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			show_heading: { control: "boolean", description: "Whether to show heading" }
		}
	});
</script>

<Story name="Long and space-separated label text" args={{
	value: {
		label: "Label",
		confidences: [
			{ label: "Long space separated label text, ".repeat(10), confidence: 0.8 }
		]
	}
}}>
	{#snippet template(args)}
		<Label {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Multiple label text with show_heading set to false" args={{
	show_heading: false,
	value: {
		label: "Label",
		confidences: [
			{ label: "First Label", confidence: 0.7 },
			{ label: "Second Label", confidence: 0.2 }
		]
	}
}}>
	{#snippet template(args)}
		<Label {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Single label text with show_heading set to false" args={{
	show_heading: false,
	value: { label: "Test label", confidence: 0.8 }
}}>
	{#snippet template(args)}
		<Label {...wrapProps(args)} />
	{/snippet}
</Story>
