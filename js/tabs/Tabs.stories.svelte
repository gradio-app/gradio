<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { BaseTabs } from "./Index.svelte";

	const cheetah = "/cheetah.jpg";

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

	function makeTab(label, id, component_id, alignment = "left") {
		return {
			label,
			id,
			elem_id: undefined,
			visible: true,
			interactive: true,
			scale: null,
			component_id,
			alignment
		};
	}

	const overflowTabs = [
		makeTab("Overview", "overview", 1),
		makeTab("Model Settings", "models", 2),
		makeTab("Generation", "generation", 3),
		makeTab("Audio Conversion", "audio", 4),
		makeTab("Outputs", "outputs", 5),
		makeTab("Extensions", "extensions", 6),
		makeTab("System Info", "system", 7),
		makeTab("Installed Packages", "packages", 8),
		makeTab("Advanced Options", "advanced", 9, "right"),
		makeTab("About", "about", 10, "right")
	];

	const wrappedTabs = [
		makeTab(
			"A very long tab label that should truncate within the available width",
			"long",
			1
		),
		...overflowTabs.slice(1).map((tab, index) => ({
			...tab,
			component_id: index + 2
		}))
	];
</script>

<Story name="Tabs" args={{ initial_tabs: basicTabs, selected: "tab-1" }}>
	{#snippet template(args)}
		<BaseTabs {...args}>
			<div style="padding: 1rem;">
				<img style="width: 200px;" alt="Cheetah" src={cheetah} />
			</div>
		</BaseTabs>
	{/snippet}
</Story>

<Story
	name="MenuOverflowWithRightAlignedTabs"
	args={{
		initial_tabs: overflowTabs,
		selected: "generation",
		overflow_behavior: "menu"
	}}
>
	{#snippet template(args)}
		<div style="width: 520px; max-width: 100%;">
			<BaseTabs {...args}>
				<div style="padding: 1rem;">Generation tab content</div>
			</BaseTabs>
		</div>
	{/snippet}
</Story>

<Story
	name="WrappedTabsWithRightAlignmentAndLongLabel"
	args={{
		initial_tabs: wrappedTabs,
		selected: "long",
		overflow_behavior: "wrap"
	}}
>
	{#snippet template(args)}
		<div style="width: 420px; max-width: 100%;">
			<BaseTabs {...args}>
				<div style="padding: 1rem;">Selected tab content</div>
			</BaseTabs>
		</div>
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
