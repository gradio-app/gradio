<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Chatbot from "./static";
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
			defaultValue: true,
		},
		rtl: {
			options: [true, false],
			description: "Whether to render right-to-left",
			control: { type: "boolean" },
			defaultValue: false,
		},
	}}
/>

<Template let:args>
	<Chatbot
		{...args}
		value={[
			[
				"Can you write a function in Python?",
				"```py\ndef test():\n\tprint(x)\n```",
			],
			["Can you do math?", "$$1+1=2$$"],
			["Can you say nothing?", null],
		]}
	/>
</Template>

<Story
	name="Chatbot with math enabled"
	args={{ latex_delimiters: [{ left: "$$", right: "$$", display: true }] }}
/>

<Story
	name="Chatbot with math disabled, small height"
	args={{ latex_delimiters: [], height: 200 }}
/>

<Story
	name="Chatbot with text rendered right-to-left"
	args={{
		rtl: true,
		latex_delimiters: [{ left: "$$", right: "$$", display: true }],
	}}
/>

<Story
	name="Chatbot with copy button"
	args={{
		rtl: true,
		latex_delimiters: [{ left: "$$", right: "$$", display: true }],
		show_copy_button: true,
	}}
/>

<Story
	name="Chatbot with chat bubble full width disabled"
	args={{
		bubble_full_width: false,
	}}
/>

<Story
	name="Chatbot with panel layout enabled"
	args={{
		bubble_full_width: false,
		layout: "panel",
	}}
/>

<Story
	name="Chatbot with panel layout enabled and avatars"
	args={{
		layout: "panel",
		avatar_images: [
			"https://avatars.githubusercontent.com/u/100000?v=4",
			"https://avatars.githubusercontent.com/u/100000?v=4",
		],
	}}
/>

<Story
	name="Chatbot with bubble layout enabled and avatars"
	args={{
		bubble_full_width: true,
		layout: "bubble",
		avatar_images: [
			"https://avatars.githubusercontent.com/u/100000?v=4",
			"https://avatars.githubusercontent.com/u/100000?v=4",
		],
	}}
/>
