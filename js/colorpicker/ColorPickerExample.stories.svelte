<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import ColorPicker from "./Example.svelte";

	const { Story } = defineMeta({
		title: "Components/Color Picker/Example",
		component: ColorPicker
	});
</script>

<Story
	name="Color value"
	args={{
		value: "#ff0000"
	}}
>
	{#snippet template(args)}
		<ColorPicker {...args} />
	{/snippet}
</Story>

<Story
	name="Null"
	args={{
		value: null
	}}
>
	{#snippet template(args)}
		<ColorPicker {...args} />
	{/snippet}
</Story>
