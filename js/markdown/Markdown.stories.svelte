<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Markdown from "./Index.svelte";
</script>

<Meta
	title="Components/Markdown"
	component={Markdown}
	argTypes={{
		rtl: {
			options: [true, false],
			description: "Whether to render right-to-left",
			control: { type: "boolean" },
			defaultValue: false
		}
	}}
/>

<Template let:args>
	<Markdown
		value="Here's some **bold** text. And some *italics* and some `code`"
		latex_delimiters={[]}
		{...args}
	/>
</Template>

<Story name="Simple inline Markdown" />

<Story
	name="Multiline Markdown"
	args={{
		value: `
This should
all be in one line.

---

This should be

in two separate lines.`
	}}
/>

<Story
	name="Markdown with Wide Content (Horizontal Scrolling)"
	args={{
		value: `| ids                 | ids                 | ids                 |
| ---------------------------------- | ---------------------------------- | ---------------------------------- |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
`
	}}
/>

<Story name="Right aligned Markdown" args={{ rtl: true }} />

<Story
	name="Markdown with LaTeX"
	args={{
		value: "What is the solution of $y=x^2$?",
		latex_delimiters: [{ left: "$", right: "$", display: false }]
	}}
/>

<Story
	name="Markdown with header links"
	args={{
		value: "# Visit [Gradio](https://gradio.app) for more information",
		header_links: true
	}}
/>
