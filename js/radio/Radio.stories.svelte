<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Radio from "./Index.svelte";
</script>

<Meta
	title="Components/Radio"
	component={Radio}
	argTypes={{
		disabled: {
			control: [true, false],
			description: "Whether the radio is disabled",
			name: "interactive",
			value: false
		}
	}}
/>

<Template let:args>
	<Radio {...args} />
</Template>

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
		label: "Radio"
	}}
/>

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
		rtl: true
	}}
/>
