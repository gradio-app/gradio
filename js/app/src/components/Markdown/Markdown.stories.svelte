<script>
	import {Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Markdown from "./Markdown.svelte";
</script>

<Meta
	title="Components/Markdown"
	component={Markdown}
	argTypes={{
		text_align: {
			options: ["left", "center", "right"],
			description: "Whether to align the text left or right",
			control: { type: "select" },
			defaultValue: "left"
		}
	}}
/>


<Template let:args>
	<Markdown
		{...args}
		value="Here's some <strong>bold</strong> text. And some <em>italics</em> and some <code>code</code>"
	/>
</Template>

<Story
	name="Simple inline Markdown"
	args={{  }}
/>
<Story
	name="Right aligned Markdown"
	args={{ text_align: "right" }}
/>

