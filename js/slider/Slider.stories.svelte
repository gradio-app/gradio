<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Slider from "./interactive";
</script>

<Meta title="Components/Slider" component={Slider} />

<Template let:args>
	<Slider {...args} />
</Template>

<Story
	name="Slider with min 0 and max 100"
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
	name="Slider with hidden label"
	args={{
		show_label: false
	}}
/>

<Story
	name="Slider with min 0 and max 100 and default value of 50"
	args={{
		value: 50,
		minimum: 0,
		maximum: 100
	}}
/>
