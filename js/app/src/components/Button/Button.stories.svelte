<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import { Button } from "@gradio/button";
</script>

<Meta title="Button" component={Button} />

<Template let:args>
	<Button size="lg" variant="primary">Test Button</Button>
</Template>

<Story name="Primary" />
