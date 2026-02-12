<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Dropdown from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Multiselect",
		component: Dropdown,
		argTypes: {
			multiselect: {
				control: [true, false],
				name: "multiselect",
				value: false
			}
		}
	});
</script>

{#snippet template(args)}
	<Dropdown {...wrapProps(args)} />
{/snippet}

<Story
	name="Multiselect Interactive"
	args={{
		value: ["swim", "run"],
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Multiselect Dropdown",
		multiselect: true,
		interactive: true
	}}
	{template}
/>
<Story
	name="Multiselect Static"
	args={{
		value: ["swim", "run"],
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Multiselect Dropdown",
		multiselect: true,
		interactive: false
	}}
	{template}
/>
