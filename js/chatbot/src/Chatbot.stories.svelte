<script>
	import {Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Chatbot from "./Index.svelte";
</script>

<Meta
	title="Components/Chatbot"
	component={Chatbot}
	argTypes={{
		label: {
			control: "text",
			description: "The textbox label",
			name: "label",
		},
		show_label: {
			options: [true, false],
			description: "Whether to show the label",
			control: { type: "boolean" },
			defaultValue: true
		},
		text_align: {
			options: ["left", "right"],
			description: "Whether to align the text left or right",
			control: { type: "select" },
			defaultValue: "left"
		},
	}}
/>

<Template let:args>
	<Chatbot
		{...args}
		value={[["Can you write a function in Python?", "```py\ndef test():\n\tprint(x)\n```"], ["Can you do math?", "$$1+1=2$$"]]}
	/>
</Template>

<Story
	name="Chatbot with math enabled"
	args={{ latex_delimiters: [{ "left": "$$", "right": "$$", "display": true }] }}
/>

<Story
	name="Chatbot with math disabled, small height"
	args={{ latex_delimiters: [], height: 200 }}
/>

<Story
	name="Chatbot with text aligned to the right"
	args={{ text_align: "right", latex_delimiters: [{ "left": "$$", "right": "$$", "display": true }]}}
/>

