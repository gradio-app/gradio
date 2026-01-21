<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import HTML from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/HTML",
		component: HTML,
		argTypes: {
			max_height: {
				description: "Maximum height of the HTML component",
				control: { type: "text" },
				defaultValue: "200px",
			},
		},
	});

	const simpleValue = "<p>This is some <strong>HTML</strong> content.</p>";

	const longValue = `
		<h1>Heading</h1>
		${Array(50).fill("<p>This is some text. This is some more text to make the content longer.</p>").join("\n")}
	`;
</script>

<Story name="Simple HTML (No Label)" args={{}}>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				value: simpleValue,
				show_label: false,
				...args,
			})}
		/>
	{/snippet}
</Story>

<Story name="Simple HTML (With Label)" args={{}}>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				value: simpleValue,
				show_label: true,
				label: "HTML Output",
				...args,
			})}
		/>
	{/snippet}
</Story>

<Story
	name="Long Content (No Label)"
	args={{
		max_height: "200px",
	}}
>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				value: longValue,
				show_label: false,
				...args,
			})}
		/>
	{/snippet}
</Story>

<Story
	name="Long Content (With Label)"
	args={{
		max_height: "200px",
	}}
>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				value: longValue,
				show_label: true,
				label: "HTML Output",
				...args,
			})}
		/>
	{/snippet}
</Story>

<Story
	name="HTML with no padding and a label"
	args={{
		value: `<div style="background: red;">${simpleValue}</div>`,
		padding: false
	}}
>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				...args
			})}
		/>
	{/snippet}
</Story>


<Story
	name="HTML with no padding, no label"
	args={{
		show_label: false,
		value: `<div style="background: red;">${simpleValue}</div>`,
		padding: false
	}}
>
	{#snippet template(args)}
		<HTML
			{...wrapProps({
				...args
			})}
		/>
	{/snippet}
</Story>



