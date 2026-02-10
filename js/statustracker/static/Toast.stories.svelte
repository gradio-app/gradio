<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Toast from "./Toast.svelte";
	import { allModes } from "../../storybook/modes";

	const { Story } = defineMeta({
		title: "Components/Toast",
		component: Toast,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"],
				},
			},
		},
		argTypes: {
			messages: {
				control: "object",
				description: "Array of toast messages to display",
			},
		},
	});

	function noop() {}
</script>

{#snippet template(args)}
	<div style="min-height: 400px; position: relative;">
		<Toast messages={args.messages} on_close={noop} />
	</div>
{/snippet}

<Story
	name="Error Toast"
	args={{
		messages: [
			{
				type: "error",
				title: "Error",
				message: "Something went wrong. Please try again.",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Warning Toast"
	args={{
		messages: [
			{
				type: "warning",
				title: "Warning",
				message: "This action may have unintended consequences.",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Info Toast"
	args={{
		messages: [
			{
				type: "info",
				title: "Info",
				message: "Here is some useful information.",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Success Toast"
	args={{
		messages: [
			{
				type: "success",
				title: "Success",
				message: "Operation completed successfully!",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Toast with Auto-dismiss"
	args={{
		messages: [
			{
				type: "info",
				title: "Info",
				message: "This toast will auto close in 10 seconds.",
				id: 1,
				duration: 10,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Multiple Messages Same Type"
	args={{
		messages: [
			{
				type: "error",
				title: "Error",
				message: "First error message.",
				id: 1,
				duration: null,
				visible: true,
			},
			{
				type: "error",
				title: "Error",
				message: "Second error message.",
				id: 2,
				duration: null,
				visible: true,
			},
			{
				type: "error",
				title: "Error",
				message: "Third error message.",
				id: 3,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Multiple Toast Types"
	args={{
		messages: [
			{
				type: "error",
				title: "Error",
				message: "An error occurred.",
				id: 1,
				duration: null,
				visible: true,
			},
			{
				type: "warning",
				title: "Warning",
				message: "A warning to consider.",
				id: 2,
				duration: null,
				visible: true,
			},
			{
				type: "success",
				title: "Success",
				message: "Task completed.",
				id: 3,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Toast with HTML Content"
	args={{
		messages: [
			{
				type: "info",
				title: "Info",
				message:
					"Click <a href='https://gradio.app' target='_blank'>here</a> for a link.",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Long Message"
	args={{
		messages: [
			{
				type: "warning",
				title: "Warning",
				message:
					"This is a very long warning message. This is a very long warning message. This is a very long warning message. This is a very long warning message. This is a very long warning message.",
				id: 1,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>

<Story
	name="Disconnected (Empty Messages)"
	args={{
		messages: [
			{
				type: "error",
				title: "Error",
				message: "",
				id: 1,
				duration: null,
				visible: true,
			},
			{
				type: "error",
				title: "Error",
				message: null,
				id: 2,
				duration: null,
				visible: true,
			},
			{
				type: "error",
				title: "Error",
				message: undefined,
				id: 3,
				duration: null,
				visible: true,
			},
		],
	}}
	{template}
/>
