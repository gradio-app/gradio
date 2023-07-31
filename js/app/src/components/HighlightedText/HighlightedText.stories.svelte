<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import HighlightedText from "./HighlightedText.svelte";
</script>

<Meta title="Components/HighlightedText" component={HighlightedText} />

<Template let:args>
	<HighlightedText
		value={[
			["zebras", "+"],
			["dogs", "-"],
			["elephants", "+"],
		]}
		{...args}
	/>
</Template>

<Story name="Highlighted Text" />
<Story name="Highlighted Text with legend" args={{ show_legend: true }} />
<Story name="Highlighted Text with label" args={{ label: "animals" }} />
<Story
	name="Highlighted Text with new lines"
	args={{
		value: [["zebras", "+"], ["\n"], ["dogs", "-"], ["\n"], ["elephants", "+"]],
	}}
/>
<Story
	name="Highlighted Text with color map"
	args={{ color_map: { "+": "green", "-": "red" } }}
/>
