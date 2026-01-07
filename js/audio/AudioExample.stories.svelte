<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Audio from "./Example.svelte";

	const { Story } = defineMeta({
		title: "Components/Audio/Example",
		component: Audio
	});
</script>

<Story name="Audio file" args={{
	value: "cantina.mp3"
}}>
	{#snippet template(args)}
		<Audio {...args} />
	{/snippet}
</Story>

<Story name="Null" args={{
	value: null
}}>
	{#snippet template(args)}
		<Audio {...args} />
	{/snippet}
</Story>
