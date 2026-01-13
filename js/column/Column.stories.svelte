<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Column from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
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
	});
</script>

<Story name="Column Layout">
	{#snippet template(args)}
		<Column {...wrapProps(args)}>
			<Button elem_id="btn" size="lg">test</Button>
			<Button elem_id="btn" size="lg">test</Button>
		</Column>
	{/snippet}
</Story>

<Story name="Column with multiple items">
	{#snippet template(args)}
		<Column {...wrapProps(args)}>
			<Button elem_id="btn1" size="lg">Button 1</Button>
			<Button elem_id="btn2" size="lg">Button 2</Button>
			<Button elem_id="btn3" size="lg">Button 3</Button>
		</Column>
	{/snippet}
</Story>
