<script context="module">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import HTML from "./Index.svelte";

	const example_html =
		"<div style='background-color: pink; padding: 10px; border-radius: 5px;'>Hello World</div>";

	const meta_only_html = "<meta http-equiv='Content-Language' content='zh-CN'>";

	const mixed_content_html =
		"<meta name='description' content='Hello World'><div style='padding: 10px; background: #f0f0f0; border-radius: 5px;'><h3>Mixed Content Example</h3><p>This has both meta tags and visible content.</p></div><meta name='keywords' content='test, gradio, html'>";
</script>

<Meta title="Components/HTML" component={HTML} />

<Template let:args>
	<HTML value={example_html} {...args} />
</Template>

<Story name="Default HTML" args={{}} />

<Story
	name="Meta tags only (should not be visible)"
	args={{
		value: meta_only_html,
		padding: true
	}}
/>

<Story
	name="Mixed content with meta tags"
	args={{
		value: mixed_content_html,
		padding: true
	}}
/>

<Story
	name="With custom padding disabled"
	args={{
		value: example_html,
		padding: false
	}}
/>

<Story
	name="With label and container"
	args={{
		value: example_html,
		show_label: true,
		label: "HTML Output",
		container: true
	}}
/>
