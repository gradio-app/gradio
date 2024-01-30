<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Group from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
</script>

<Meta title="Layout Elements/Group" component={Group} />

<Template let:args>
	<Group {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Group>
</Template>

<Story name="Row Layout" />
