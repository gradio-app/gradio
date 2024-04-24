<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import ColorPicker from "./Example.svelte";
</script>

<Meta title="Components/Color Picker/Example" component={ColorPicker} />

<Template let:args>
	<ColorPicker {...args} />
</Template>

<Story
	name="Color value"
	args={{
		value: "#ff0000"
	}}
/>

<Story
	name="Null"
	args={{
		value: null
	}}
/>
