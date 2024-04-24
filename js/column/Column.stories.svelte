<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Column from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Layout Elements/Column",
		component: Column,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	};
</script>

<Template let:args>
	<Column {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Column>
</Template>

<Story name="Column Layout" />
