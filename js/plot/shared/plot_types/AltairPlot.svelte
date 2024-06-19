<script lang="ts">
	//@ts-nocheck
	import { colors as color_palette } from "@gradio/theme";
	import { get_next_color } from "@gradio/utils";
	import { create_config } from "./altair_utils";
	import { afterUpdate } from "svelte";
	import type { Spec } from "vega-lite";
	import vegaEmbed from "vega-embed";

	export let value;
	export let target: HTMLDivElement;
	export let colors: string[] = [];
	export let caption: string;
	export let show_actions_button: bool;
	let element: HTMLElement;
	let parent_element: HTMLElement;

	function get_color(index: number): string {
		let current_color = colors[index % colors.length];

		if (current_color && current_color in color_palette) {
			return color_palette[current_color as keyof typeof color_palette]
				?.primary;
		} else if (!current_color) {
			return color_palette[get_next_color(index) as keyof typeof color_palette]
				.primary;
		}
		return current_color;
	}
	let computed_style = window.getComputedStyle(target);

	$: plot = value?.plot;
	$: spec = JSON.parse(plot) as Spec;
	$: console.log(spec);
	$: if (value.chart) {
		const config = create_config(computed_style);
		spec.config = config;
	}
	$: switch (value.chart) {
		case "scatter":
			if (spec.encoding.color && spec.encoding.color.type == "nominal") {
				spec.encoding.color.scale.range = spec.encoding.color.scale.range.map(
					(e, i) => get_color(i)
				);
			} else if (
				spec.encoding.color &&
				spec.encoding.color.type == "quantitative"
			) {
				spec.encoding.color.scale.range = ["#eff6ff", "#1e3a8a"];
				spec.encoding.color.scale.range.interpolate = "hsl";
			}
			break;
		case "line":
			spec.layer.forEach((d) => {
				if (d.encoding.color) {
					d.encoding.color.scale.range = d.encoding.color.scale.range.map(
						(e, i) => get_color(i)
					);
				}
			});
			break;
		case "bar":
			if (spec.encoding.color) {
				spec.encoding.color.scale.range = spec.encoding.color.scale.range.map(
					(e, i) => get_color(i)
				);
			}
			break;
	}
	// Create a resize observer for element that resizes plot
	const renderPlot = () => {
		spec.width = parent_element.offsetWidth;
		vegaEmbed(element, spec, { actions: show_actions_button });
	};
	let resizeObserver = new ResizeObserver(() => {
		if (spec.width !== parent_element.offsetWidth) {
			renderPlot();
		}
	});
	afterUpdate(() => {
		renderPlot();
		resizeObserver.observe(parent_element);
	});
</script>

<div data-testid={"altair"} class="altair layout" bind:this={parent_element}>
	<div bind:this={element}></div>
	{#if caption}
		<div class="caption layout">
			{caption}
		</div>
	{/if}
</div>

<style>
	.altair :global(canvas) {
		padding: 6px;
	}
	.altair :global(.vega-embed) {
		padding: 0px !important;
	}
	.altair :global(.vega-actions) {
		right: 0px !important;
	}
	.layout {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		color: var(--body-text-color);
	}
	.altair {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
	}
	.caption {
		font-size: var(--text-sm);
		margin-bottom: 6px;
	}
	:global(#vg-tooltip-element) {
		font-family: var(--font) !important;
		font-size: var(--text-xs) !important;
		box-shadow: none !important;
		background-color: var(--block-background-fill) !important;
		border: 1px solid var(--border-color-primary) !important;
		color: var(--body-text-color) !important;
	}
	:global(#vg-tooltip-element .key) {
		color: var(--body-text-color-subdued) !important;
	}
</style>
