<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Login from "./Login.svelte";

	const { Story } = defineMeta({
		title: "Components/Login Page",
		component: Login,
		argTypes: {
			auth_message: {
				control: "text",
				description: "The optional auth message to display",
				name: "label",
				value: "Gradio Button"
			}
		}
	});
</script>

{#snippet login(args: Record<string, any>)}
	<Login {...args} />
{/snippet}

<Story name="Login page without auth message" args={{ auth_message: null }}>
	{#snippet template(args)}
		{@render login(args)}
	{/snippet}
</Story>

<Story
	name="Login page with auth message"
	args={{ auth_message: "Log in to this great gradio app" }}
>
	{#snippet template(args)}
		{@render login(args)}
	{/snippet}
</Story>

<Story
	name="Login page with HTML auth message"
	args={{
		auth_message: "<em>Log in to this <strong>great</strong> gradio app</em>"
	}}
>
	{#snippet template(args)}
		{@render login(args)}
	{/snippet}
</Story>
