<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Markdown from "./static";
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
		value="Here's some <strong>bold</strong> text. And some <em>italics</em> and some <code>code</code>"
		{...args}
	/>
</Template>

<Story name="Simple inline Markdown with HTML" />

<Story name="Right aligned Markdown with HTML" args={{ rtl: true }} />

<Story
	name="Markdown with math"
	args={{
		value: "What is the solution of $y=x^2$?",
		latex_delimiters: [{ left: "$", right: "$", display: false }]
	}}
/>
