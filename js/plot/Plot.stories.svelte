<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import PlotComponent from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { matplotlib_plot } from "./testplot";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
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
	});
</script>

<Story
	name="with matplotlib value"
	args={{
		value: matplotlib_plot,
		label: "Plot"
	}}
>
	{#snippet template(args)}
		<PlotComponent {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="with no value"
	args={{
		label: "Plot"
	}}
>
	{#snippet template(args)}
		<PlotComponent {...wrapProps(args)} />
	{/snippet}
</Story>
