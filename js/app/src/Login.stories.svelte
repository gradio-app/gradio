<script lang="ts">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Login from "./Login.svelte";
</script>

<Meta
	title="Components/Login Page"
	component={Login}
	argTypes={{
		auth_message: {
			control: "text",
			description: "The optional auth message to display",
			name: "label",
			value: "Gradio Button"
		}
	}}
/>

<Template let:args>
	<Login {...args} />
</Template>

<Story name="Login page without auth message" args={{ auth_message: null }} />
<Story
	name="Login page with auth message"
	args={{ auth_message: "Log in to this great gradio app" }}
/>
