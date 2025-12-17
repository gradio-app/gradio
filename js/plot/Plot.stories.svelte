<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import PlotComponent from "./Index.svelte";
	import IndexWrapper from "../storybook/helpers/IndexWrapper.svelte";
	import { allModes } from "../storybook/modes";
	import { matplotlib_plot } from "./testplot";

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
	<IndexWrapper component={PlotComponent} label="Plot" {...args} />
</Template>

<Story
	name="with matplotlib value"
	args={{
		value: matplotlib_plot,
		label: "Plot"
	}}
/>

<!-- 
<Story
	name="with line plot value"
	args={{
		value: line_plot
	}}
	parameters={{
		chromatic: { delay: 1000  }
	}}
/>

<Story
	name="with multi-line plot value"
	args={{
		value: multi_line_plot
	}}
	parameters={{
		chromatic: { delay: 1000  }
	}}
/>

<Story
	name="with scatter plot value"
	args={{
		value: scatter_plot
	}}
	parameters={{
		chromatic: { delay: 1000  }
	}}
/>

<Story
	name="with bar plot value"
	args={{
		value: bar_plot
	}}
	parameters={{
		chromatic: { delay: 1000  }
	}}
/> -->

<Story
	name="with no value"
	args={{
		label: "Plot"
	}}
/>
