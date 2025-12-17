<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Checkboxgroup from "./Index.svelte";
	import IndexWrapper from "../storybook/helpers/IndexWrapper.svelte";
</script>

<Meta
	title="Components/CheckboxGroup"
	component={Checkboxgroup}
	argTypes={{
		disabled: {
			control: [true, false],
			description: "Whether the CheckboxGroup is disabled",
			name: "interactive",
			value: false
		}
	}}
/>

<Template let:args>
	<IndexWrapper component={Checkboxgroup} label="Checkbox Group" {...args} />
</Template>

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
/>

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
/>

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
/>

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
/>

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
/>

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
/>

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
/>
