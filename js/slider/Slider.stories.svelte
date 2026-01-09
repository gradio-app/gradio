<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Slider from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Slider",
		component: Slider,
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
			value: { control: "number", description: "Current value" },
			interactive: { control: "boolean", description: "Whether interactive" },
			show_label: { control: "boolean", description: "Whether to show label" }
		}
	});
</script>

{#snippet template(args)}
	<Slider {...wrapProps(args)} />
{/snippet}

<Story
	name="Slider with min and max"
	args={{ minimum: 0, maximum: 100, interactive: true }}
	{template}
/>
<Story
	name="Slider with step of 10"
	args={{ minimum: 0, maximum: 100, step: 10, interactive: true }}
	{template}
/>
<Story
	name="Slider with hidden label and negative value"
	args={{
		value: -50,
		minimum: -100,
		maximum: 0,
		show_label: false,
		interactive: true
	}}
	{template}
/>
<Story
	name="Slider with min, max, and default value"
	args={{ value: 50, minimum: 0, maximum: 100, interactive: true }}
	{template}
/>
<Story
	name="Non-interactive Slider"
	args={{ value: 30, minimum: 0, maximum: 100, interactive: false }}
	{template}
/>
<Story
	name="Slider with reset button hidden"
	args={{
		value: 50,
		minimum: 10,
		maximum: 100,
		show_reset_button: false,
		interactive: true
	}}
	{template}
/>
