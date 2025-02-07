<script context="module">
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import NativePlot from "./Index.svelte";

	export const meta = {
		title: "Components/NativePlot",
		component: NativePlot,
		parameters: {
			chromatic: { delay: 500 }
		}
	};
</script>

<Template let:args>
	<div style="width: 600px; height: 400px;">
		<NativePlot {...args} />
	</div>
</Template>

<Story
	name="Scatter Plot"
	args={{
		value: {
			columns: ["x", "y", "category"],
			data: [
				[1, 2, "A"],
				[2, 4, "A"],
				[3, 1, "B"],
				[4, 5, "B"],
				[5, 3, "C"],
				[6, 6, "C"]
			],
			datatypes: {
				x: "quantitative",
				y: "quantitative",
				category: "nominal"
			},
			mark: "point"
		},
		x: "x",
		y: "y",
		color: "category",
		title: "Sample Scatter Plot",
		x_title: "X Axis",
		y_title: "Y Axis",
		color_title: "Categories",
		label: "Scatter Plot",
		show_label: true,
		tooltip: "all"
	}}
/>

<Story
	name="Line Plot"
	args={{
		value: {
			columns: ["time", "value"],
			data: [
				[1, 10],
				[2, 15],
				[3, 13],
				[4, 17],
				[5, 14],
				[6, 20]
			],
			datatypes: {
				time: "quantitative",
				value: "quantitative"
			},
			mark: "line"
		},
		x: "time",
		y: "value",
		title: "Sample Line Plot",
		x_title: "Time",
		y_title: "Value",
		label: "Line Plot",
		show_label: true
	}}
/>

<Story
	name="Empty Plot"
	args={{
		value: null,
		label: "Empty Plot",
		show_label: true
	}}
/>
