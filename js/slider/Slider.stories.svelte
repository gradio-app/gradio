<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Slider from "./Index.svelte";
</script>

<Meta title="Components/Slider" component={Slider} />

<Template let:args>
	<Slider interactive={true} {...args} />
</Template>

<Story
	name="Slider with min and max"
	args={{
		minimum: 0,
		maximum: 100
	}}
/>

<Story
	name="Slider with step of 10"
	args={{
		step: 10
	}}
/>

<Story
	name="Slider with hidden label and negative value"
	args={{
		value: -50,
		minimum: -100,
		maximum: 0,
		show_label: false
	}}
/>

<Story
	name="Slider with min, max, and default value"
	args={{
		value: 50,
		minimum: 0,
		maximum: 100
	}}
/>

<Story
	name="Non-interactive Slider"
	args={{
		value: 30,
		interactive: false
	}}
/>

<Story
	name="Slider with reset button"
	args={{
		value: 50,
		minimum: 10,
		maximum: 100,
		show_reset_button: true
	}}
/>
