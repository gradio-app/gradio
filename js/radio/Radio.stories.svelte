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
	name="Radio with Different Names and Values"
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
