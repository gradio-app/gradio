<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Column from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";

	export const meta = {
		title: "Layout Elements/Column",
		component: Column
	};
</script>

<Template let:args>
	<Column {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Column>
</Template>

<Story name="Column Layout" />
