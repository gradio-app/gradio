<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { BaseTabs } from "./Index.svelte";

	const { Story } = defineMeta({
		title: "Components/Tabs",
		component: BaseTabs
	});

	const basicTabs = [
		{
			label: "Image Tab",
			id: "tab-1",
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id: 1
		},
		{
			label: "Hidden Tab",
			id: "tab-2",
			elem_id: undefined,
			visible: false,
			interactive: true,
			scale: null,
			component_id: 2
		},
		{
			label: "Visible Tab",
			id: "tab-3",
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id: 3
		}
	];

	const manyTabs = [
		{
			label: "This is visible tab 1",
			id: "tab-1",
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id: 1
		},
		{
			label: "This is visible tab 2",
			id: "tab-2",
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id: 2
		},
		{
			label: "This is visible tab 3",
			id: "tab-3",
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id: 3
		},
		{
			label: "This is invisible tab 4",
			id: "tab-4",
			elem_id: undefined,
			visible: false,
			interactive: true,
			scale: null,
			component_id: 4
		},
		{
			label: "This is invisible tab 5",
			id: "tab-5",
			elem_id: undefined,
			visible: false,
			interactive: true,
			scale: null,
			component_id: 5
		}
	];
</script>

<Story name="Tabs" args={{ initial_tabs: basicTabs, selected: "tab-1" }}>
	{#snippet template(args)}
		<BaseTabs {...args}>
			<div style="padding: 1rem;">
				<img
					style="width: 200px;"
					alt="Cheetah"
					src="https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg"
				/>
			</div>
		</BaseTabs>
	{/snippet}
</Story>

<Story
	name="TabsLastInvisible"
	args={{ initial_tabs: manyTabs, selected: "tab-1" }}
>
	{#snippet template(args)}
		<BaseTabs {...args}>
			<div style="padding: 1rem;">Tab content goes here</div>
		</BaseTabs>
	{/snippet}
</Story>
