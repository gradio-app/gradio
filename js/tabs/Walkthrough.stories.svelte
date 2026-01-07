<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Walkthrough from "./shared/Walkthrough.svelte";

	const { Story } = defineMeta({
		title: "Components/Walkthrough",
		component: Walkthrough
	});

	const walkthroughTabs = [
		{ label: "Image Tab", id: "tab-1", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 1 },
		{ label: "Hidden Tab", id: "tab-2", elem_id: undefined, visible: false, interactive: true, scale: null, component_id: 2 },
		{ label: "Visible Tab 1", id: "tab-3", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 3 },
		{ label: "Visible Tab 2", id: "tab-4", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 4 }
	];

	const lastInvisibleTabs = [
		{ label: "This is visible tab 1", id: "tab-1", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 1 },
		{ label: "This is visible tab 2", id: "tab-2", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 2 },
		{ label: "This is visible tab 3", id: "tab-3", elem_id: undefined, visible: true, interactive: true, scale: null, component_id: 3 },
		{ label: "This is invisible tab 4", id: "tab-4", elem_id: undefined, visible: false, interactive: true, scale: null, component_id: 4 },
		{ label: "This is invisible tab 5", id: "tab-5", elem_id: undefined, visible: false, interactive: true, scale: null, component_id: 5 }
	];
</script>

<Story name="Tabs Walkthrough" args={{ initial_tabs: walkthroughTabs, selected: "tab-1" }}>
	{#snippet template(args)}
		<Walkthrough {...args}>
			<div style="padding: 1rem;">
				<img
					style="width: 200px;"
					alt="Cheetah"
					src="https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg"
				/>
			</div>
		</Walkthrough>
	{/snippet}
</Story>

<Story name="TabsLastInvisible" args={{ initial_tabs: lastInvisibleTabs, selected: "tab-1" }}>
	{#snippet template(args)}
		<Walkthrough {...args}>
			<div style="padding: 1rem;">
				Walkthrough content goes here
			</div>
		</Walkthrough>
	{/snippet}
</Story>
