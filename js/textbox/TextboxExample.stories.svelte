<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Textbox from "./Example.svelte";
</script>

<Meta title="Components/Textbox/Example" component={Textbox} />

<Template let:args>
	<Textbox {...args} />
</Template>

<Story
	name="Text value"
	args={{
		value: "the quick brown fox"
	}}
/>

<Story
	name="Null"
	args={{
		value: null
	}}
/>
