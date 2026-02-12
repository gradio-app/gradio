<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import MultimodalTextbox from "./Example.svelte";

	const { Story } = defineMeta({
		title: "Components/MultimodalTextbox/Example",
		component: MultimodalTextbox
	});
</script>

<Story
	name="Text value"
	args={{
		value: { text: "the quick brown fox", files: [] }
	}}
>
	{#snippet template(args)}
		<MultimodalTextbox {...args} />
	{/snippet}
</Story>

<Story
	name="Empty Value"
	args={{
		value: { text: "", files: [] }
	}}
>
	{#snippet template(args)}
		<MultimodalTextbox {...args} />
	{/snippet}
</Story>
