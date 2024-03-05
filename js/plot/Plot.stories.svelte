<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import PlotComponent from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { test_plot } from "./testplot";

	export const meta = {
		title: "Components/Plot",
		component: PlotComponent,
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
	<PlotComponent value="Plot" {...args} />
</Template>

<Story
	name="with value"
	args={{
		value: test_plot,
		label: "Plot"
	}}
/>

<Story
	name="with no value"
	args={{
		label: "Plot"
	}}
/>
