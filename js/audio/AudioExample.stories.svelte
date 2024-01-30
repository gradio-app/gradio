<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Audio from "./Example.svelte";
</script>

<Meta title="Components/Audio/Example" component={Audio} />

<Template let:args>
	<Audio {...args} />
</Template>

<Story
	name="Audio file"
	args={{
		value: "cantina.mp3"
	}}
/>

<Story
	name="Null"
	args={{
		value: null
	}}
/>
