<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Accordion from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";

	export const meta = {
		title: "Layout Elements/Accordion",
		component: Accordion
	};
</script>

<Template let:args>
	<Accordion {...args} label="Open Me!" open={false}>
		<Button elem_id="btn" size="lg">test</Button>
	</Accordion>
</Template>

<Story name="Accordion Layout" />
