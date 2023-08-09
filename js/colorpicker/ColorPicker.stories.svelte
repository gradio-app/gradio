<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import ColorPicker from "./static/StaticColorpicker.svelte";
</script>

<Meta title="Components/Color Picker" component={ColorPicker} argTypes={{}} />

<Template let:args>
	<ColorPicker value="Color Picker" {...args} />
</Template>

<Story name="Default" />
<Story
	name="Color Picker with a color value and hidden label"
	args={{ value: "#FFC0CB", show_label: false }}
/>
<Story
	name="Color Picker with a color value and label"
	args={{ value: "#FFC0CB", label: "This is a neat color" }}
/>

<Story
	name="Disabled color picker"
	args={{ value: "#FFC0CB", interactive: false }}
/>

<Story
	name="Color Picker with a color value and info"
	args={{ value: "#FFC0CB", info: "This is a neat color" }}
/>
