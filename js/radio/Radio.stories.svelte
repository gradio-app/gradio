<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Radio from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Radio",
		component: Radio,
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
				description: "The radio group label"
			},
			interactive: {
				control: "boolean",
				description: "Whether the radio is interactive"
			},
			rtl: {
				control: "boolean",
				description: "Whether to render right-to-left"
			}
		}
	});
</script>

<Story
	name="Radio with choices"
	args={{
		value: "jump again",
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"],
			["jump", "jump again"]
		],
		label: "Radio",
		interactive: true
	}}
>
	{#snippet template(args)}
		<Radio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Radio with right to left text"
	args={{
		value: "option1",
		choices: [
			["Option 1", "option1"],
			["Option 2", "option2"],
			["Option 3", "option3"],
			["Option 4", "option4"]
		],
		rtl: true,
		label: "RTL Radio",
		interactive: true
	}}
>
	{#snippet template(args)}
		<Radio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Radio disabled"
	args={{
		value: "swim",
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"]
		],
		label: "Disabled Radio",
		interactive: false
	}}
>
	{#snippet template(args)}
		<Radio {...wrapProps(args)} />
	{/snippet}
</Story>
