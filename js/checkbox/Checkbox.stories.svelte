<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Checkbox from "./shared/Checkbox.svelte";
	import SharedWrapper from "../storybook/helpers/SharedWrapper.svelte";
</script>

<Meta title="Components/Checkbox" component={Checkbox} />

<Template let:args>
	<SharedWrapper component={Checkbox} {...args} />
</Template>

<Story
	name="Checkbox with label"
	args={{
		value: false,
		interactive: true,
		label: "Accept terms and conditions",
		show_label: true
	}}
/>

<Story
	name="Checkbox with info"
	args={{
		value: false,
		interactive: true,
		info: "You must accept to continue",
		show_label: false
	}}
/>

<Story
	name="Checkbox without label or info"
	args={{
		value: false,
		interactive: true,
		label: "Hidden label",
		show_label: false
	}}
/>

<Story
	name="Checkbox with label and info"
	args={{
		value: false,
		interactive: true,
		label: "Accept terms and conditions",
		info: "You must accept to continue",
		show_label: true
	}}
/>
