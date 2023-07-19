<script>
	import {Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Markdown from "./Markdown.svelte";
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
	}}
/>


<Template let:args>
	<Markdown
		{...args}
		value="Here's some <strong>bold</strong> text. And some <em>italics</em> and some <code>code</code>"
	/>
</Template>

<Story
	name="Simple inline Markdown with HTML"
/>
<Story
	name="Right aligned Markdown with HTML"
	args={{ rtl: true }}
/>

