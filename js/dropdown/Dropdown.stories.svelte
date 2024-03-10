<script lang="ts">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Dropdown from "./shared/Dropdown.svelte";
</script>

<Meta
	title="Components/Dropdown"
	component={Dropdown}
	argTypes={{
		multiselect: {
			control: [true, false],
			description: "Whether to autoplay the video on load",
			name: "multiselect",
			value: false
		}
	}}
/>

<Template let:args>
	<Dropdown {...args} />
</Template>

<Story
	name="Single-select"
	args={{
		value: "swim",
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Single-select Dropdown"
	}}
/>
<Story
	name="Single-select Static"
	args={{
		value: "swim",
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		disabled: true,
		label: "Single-select Dropdown"
	}}
/>

<Story
	name="Empty initial value"
	args={{
		interactive: true,
		choices: [
			["run", "run"],
			["swim", "swim"],
			["jump", "jump"]
		],
		label: "Empty Dropdown"
	}}
/>
