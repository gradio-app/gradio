<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Checkboxgroup from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/CheckboxGroup",
		component: Checkboxgroup,
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
				description: "The checkbox group label",
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
			interactive: {
				options: [true, false],
				description: "Whether the checkbox group is interactive",
				control: { type: "boolean" },
				defaultValue: true
			},
			show_select_all: {
				options: [true, false],
				description: "Whether to show select all option",
				control: { type: "boolean" },
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Basic Checkbox Group"
	args={{
		value: ["swim", "run"],
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"]
		],
		label: "Select your activities",
		interactive: true,
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup with info"
	args={{
		value: ["swim"],
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"],
			["Bike", "bike"]
		],
		label: "Select your activities",
		info: "Choose all the activities you enjoy",
		interactive: true,
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup with select all"
	args={{
		value: ["run"],
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"],
			["Bike", "bike"],
			["Dance", "dance"]
		],
		label: "Select your activities",
		info: "Choose all the activities you enjoy",
		interactive: true,
		show_label: true,
		show_select_all: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup without label"
	args={{
		value: ["swim", "run"],
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"]
		],
		label: "Select your activities",
		interactive: true,
		show_label: false
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup disabled"
	args={{
		value: ["swim", "run"],
		choices: [
			["Run", "run"],
			["Swim", "swim"],
			["Jump", "jump"]
		],
		label: "Select your activities",
		interactive: false,
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup with many options"
	args={{
		value: ["python", "javascript"],
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
		label: "Select programming languages",
		info: "Select all languages you're familiar with",
		interactive: true,
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="CheckboxGroup with different display and internal values"
	args={{
		value: ["jump", "jump_again"],
		choices: [
			["Running (Cardio)", "run"],
			["Swimming (Full Body)", "swim"],
			["Jumping (Beginner)", "jump"],
			["Jumping (Advanced)", "jump_again"]
		],
		label: "Exercise Selection",
		info: "Internal values differ from display text",
		interactive: true,
		show_label: true
	}}
>
	{#snippet template(args)}
		<Checkboxgroup {...wrapProps(args)} />
	{/snippet}
</Story>
