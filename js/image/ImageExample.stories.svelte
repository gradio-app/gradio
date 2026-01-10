<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Image from "./Example.svelte";

	const { Story } = defineMeta({
		title: "Components/Image/Example",
		component: Image
	});
</script>

<Story
	name="Image file"
	args={{
		value: {
			path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
			orig_name: "cheetah.jpg"
		}
	}}
>
	{#snippet template(args)}
		<Image {...args} />
	{/snippet}
</Story>

<Story
	name="Null"
	args={{
		value: null
	}}
>
	{#snippet template(args)}
		<Image {...args} />
	{/snippet}
</Story>
