<script>
	import {Template, Story } from "@storybook/addon-svelte-csf";
	import Textbox from "./Textbox.svelte";
</script>


<Template let:args>
	<Textbox
		{...args}
		value="hello world"
	/>
</Template>

<Story
	name="Textbox with label"
	args={{ label: "My simple label", show_label: true }}
/>
<Story
	name="Textbox with lines specified"
	args={{ lines: 10 }}
/>
<Story
	name="Password input"
	args={{ type: "password" }}
/>
<Story
	name="Right aligned textbox"
	args={{ text_align: "right" }}
/>

