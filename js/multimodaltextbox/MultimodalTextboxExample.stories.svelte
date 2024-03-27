<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import MultimodalTextbox from "./Example.svelte";
</script>

<Meta
	title="Components/MultimodalTextbox/Example"
	component={MultimodalTextbox}
/>

<Template let:args>
	<MultimodalTextbox {...args} />
</Template>

<Story
	name="Text value"
	args={{
		value: { text: "the quick brown fox", files: [] }
	}}
/>

<Story
	name="Empty Value"
	args={{
		value: { text: "", files: [] }
	}}
/>
