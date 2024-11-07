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
		},
		height: {
			description: "Maximum height of the Markdown component",
			control: { type: "text" },
			defaultValue: "200px"
		}
	}}
/>

<Template let:args>
	<Markdown
		value="Here's some **bold** text. And some *italics* and some `code`"
		latex_delimiters={[]}
		{...args}
		height={args.height}
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

<Story
	name="Markdown with Long Content (Vertical Scrolling)"
	args={{
		value: `# Heading\n${"This is some text.\n".repeat(100)}`,
		height: "200px"
	}}
/>

<Story
	name="Markdown with Copy Button and Container"
	args={{
		value:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.",
		show_copy_button: true,
		container: true
	}}
/>
