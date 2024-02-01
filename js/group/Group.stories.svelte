<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Group from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Layout Elements/Group",
		component: Group,
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
	<Group {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Group>
</Template>

<Story name="Group Layout" />
