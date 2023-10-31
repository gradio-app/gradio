<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Number from "./Index.svelte";
</script>

<Meta title="Components/Number" component={Number} />

<Template let:args>
	<Number {...args} />
</Template>

<Story
	name="Number with min 0 and max 100"
	args={{
		minimum: 0,
		maximum: 100
	}}
/>

<Story
	name="Number with step of 10"
	args={{
		step: 10
	}}
/>

<Story
	name="Number in disabled state"
	args={{
		interactive: false
	}}
/>

<Story
	name="Number with hidden label"
	args={{
		show_label: false
	}}
/>
