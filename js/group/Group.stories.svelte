<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Group from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
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
	});
</script>

<Story name="Group Layout">
	{#snippet template(args)}
		<Group {...wrapProps(args)}>
			<Button elem_id="btn" size="lg">test</Button>
			<Button elem_id="btn" size="lg">test</Button>
		</Group>
	{/snippet}
</Story>

<Story name="Group with multiple items">
	{#snippet template(args)}
		<Group {...wrapProps(args)}>
			<Button elem_id="btn1" size="lg">Button 1</Button>
			<Button elem_id="btn2" size="lg">Button 2</Button>
			<Button elem_id="btn3" size="lg">Button 3</Button>
		</Group>
	{/snippet}
</Story>
