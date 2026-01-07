<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Dropdown from "./shared/Dropdown.svelte";
	import { allModes } from "../storybook/modes";

	const { Story } = defineMeta({
		title: "Components/Dropdown",
		component: Dropdown,
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
				description: "The dropdown label"
			},
			info: {
				control: "text",
				description: "Additional info text"
			},
			multiselect: {
				control: "boolean",
				description: "Whether to allow multiple selections"
			},
			disabled: {
				control: "boolean",
				description: "Whether the dropdown is disabled"
			}
		}
	});
</script>

<Story name="Single-select" args={{
	value: "swim",
	choices: [
		["run", "run"],
		["swim", "swim"],
		["jump", "jump"]
	],
	label: "Single-select Dropdown",
	info: "This is a single-select dropdown"
}}>
	{#snippet template(args)}
		<Dropdown {...args} />
	{/snippet}
</Story>

<Story name="Single-select Static" args={{
	value: "swim",
	choices: [
		["run", "run"],
		["swim", "swim"],
		["jump", "jump"]
	],
	disabled: true,
	label: "Single-select Dropdown"
}}>
	{#snippet template(args)}
		<Dropdown {...args} />
	{/snippet}
</Story>

<Story name="Empty initial value" args={{
	interactive: true,
	choices: [
		["run", "run"],
		["swim", "swim"],
		["jump", "jump"]
	],
	label: "Empty Dropdown"
}}>
	{#snippet template(args)}
		<Dropdown {...args} />
	{/snippet}
</Story>

<Story name="With many options" args={{
	value: "python",
	choices: [
		["Python", "python"],
		["JavaScript", "javascript"],
		["TypeScript", "typescript"],
		["Java", "java"],
		["C++", "cpp"],
		["Go", "go"],
		["Rust", "rust"],
		["Ruby", "ruby"]
	],
	label: "Programming Language"
}}>
	{#snippet template(args)}
		<Dropdown {...args} />
	{/snippet}
</Story>
