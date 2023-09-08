<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Multiselect from "./shared/Multiselect.svelte";
</script>

<Meta
	title="Components/Multiselect"
	component={Multiselect}
	argTypes={{
		multiselect: {
			control: [true, false],
			name: "multiselect",
			value: false
		}
	}}
/>

<Template let:args>
	<Multiselect {...args} />
</Template>

<Story
	name="Multiselect"
	args={{
		value: ["swim", "run"],
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Multiselect Dropdown"
	}}
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
		disabled: true
	}}
/>
