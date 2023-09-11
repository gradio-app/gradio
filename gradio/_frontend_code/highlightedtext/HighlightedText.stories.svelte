<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import HighlightedText from "./static";
	import { Gradio } from "../app/src/gradio_helper";
</script>

<Meta title="Components/HighlightedText" component={HighlightedText} />

<Template let:args>
	<HighlightedText
		value={[
			["zebras", "+"],
			["dogs", "-"],
			["elephants", "+"]
		]}
		gradio={new Gradio(
			0,
			document.body,
			"light",
			"1.1.1",
			"http://localhost:7860"
		)}
		{...args}
	/>
</Template>

<Story name="Highlighted Text" />
<Story name="Highlighted Text with legend" args={{ show_legend: true }} />
<Story name="Highlighted Text with label" args={{ label: "animals" }} />
<Story
	name="Highlighted Text with new lines"
	args={{
		value: [["zebras", "+"], ["\n"], ["dogs", "-"], ["\n"], ["elephants", "+"]]
	}}
/>
<Story
	name="Highlighted Text with color map"
	args={{ color_map: { "+": "green", "-": "red" } }}
/>
