<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Checkboxgroup from "./Index.svelte";
</script>

<Meta
	title="Components/Checkboxgroup"
	component={Checkboxgroup}
	argTypes={{
		disabled: {
			control: [true, false],
			description: "Whether the checkbox group is disabled",
			name: "interactive",
			value: false
		}
	}}
/>

<Template let:args>
	<Checkboxgroup {...args} />
</Template>

<Story
	name="Checkbox Group"
	args={{
		value: ["swim", "run"],
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Checkbox Group"
	}}
/>
<Story
	name="Checkbox Group with Different Names and Values"
	args={{
		value: ["jump", "jump again"],
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"],
			["jump", "jump again"]
		],
		label: "Multiselect Dropdown"
	}}
/>
