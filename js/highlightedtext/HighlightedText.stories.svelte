<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import HighlightedText from "./static";
	import { Gradio } from "@gradio/utils";
</script>

<Meta title="Components/HighlightedText" component={HighlightedText} />

<Template let:args>
	<HighlightedText
		value={[
			["zebras", "+"],
			["dogs", "-"],
			["elephants", "+"],
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
		value: [["zebras", "+"], ["\n"], ["dogs", "-"], ["\n"], ["elephants", "+"]],
	}}
/>
<Story
	name="Highlighted Text with color map"
	args={{ color_map: { "+": "green", "-": "red" } }}
/>

<Story
	name="Highlighted Text with combine adjacent"
	args={{
		value: [
			["The", null],
			["quick", "adjective"],
			[" sneaky", "adjective"],
			["fox", "subject"],
			[" jumped ", "past tense verb"],
			["over the", null],
			["lazy dog", "object"],
		],
		combine_adjacent: true,
	}}
/>

<Story
	name="Highlighted Text without combine adjacent"
	args={{
		value: [
			["The", null],
			["quick", "adjective"],
			[" sneaky", "adjective"],
			["fox", "subject"],
			[" jumped ", "past tense verb"],
			["over the", null],
			["lazy dog", "object"],
		],
	}}
/>

<Story
	name="Highlighted Text with combine adjacent and new lines"
	args={{
		value: [
			["The", null],
			["quick", "adjective"],
			[" sneaky", "adjective"],
			["fox", "subject"],
			["\n"],
			["jumped", "past tense verb"],
			["\n"],
			["over the", null],
			["lazy dog", "object"],
		],
		combine_adjacent: true,
	}}
/>

<Story
	name="Highlighted Text in scores mode"
	args={{
		value: [
			["the", -1],
			["quick", 1],
			["fox", 0.3],
		],

		show_legend: true,
	}}
/>
