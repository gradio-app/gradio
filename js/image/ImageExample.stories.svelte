<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Image from "./Example.svelte";
</script>

<Meta title="Components/Image/Example" component={Image} />

<Template let:args>
	<Image {...args} />
</Template>

<Story
	name="Image file"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		}
	}}
/>

<Story
	name="Null"
	args={{
		value: null
	}}
/>
