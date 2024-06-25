<script lang="ts">
	//@ts-nocheck
	import { set_config } from "./altair_utils";
	import { afterUpdate, onDestroy } from "svelte";
	import type { TopLevelSpec as Spec } from "vega-lite";
	import vegaEmbed from "vega-embed";

	export let value;
	export let target: HTMLDivElement;
	export let colors: string[] = [];
	export let caption: string;
	export let show_actions_button: bool;
	let element: HTMLElement;
	let parent_element: HTMLElement;

	let computed_style = window.getComputedStyle(target);

	let old_spec: Spec;
	let spec_width: number;
	$: plot = value?.plot;
	$: spec = JSON.parse(plot) as Spec;
	$: if (old_spec !== spec) {
		old_spec = spec;
		spec_width = spec.width;
	}

	$: if (value.chart) {
		spec = set_config(spec, computed_style, value.chart as string, colors);
	}
	$: fit_width_to_parent =
		spec.encoding?.column?.field ||
		spec.encoding?.row?.field ||
		value.chart === undefined
			? false
			: true; // vega seems to glitch with width when orientation is set

	const renderPlot = (): void => {
		if (fit_width_to_parent) {
			spec.width = Math.min(
				parent_element.offsetWidth,
				spec_width || parent_element.offsetWidth
			);
		}
		vegaEmbed(element, spec, { actions: show_actions_button });
	};
	let resizeObserver = new ResizeObserver(() => {
		if (fit_width_to_parent && spec.width !== parent_element.offsetWidth) {
			renderPlot();
		}
	});
	afterUpdate(() => {
		renderPlot();
		resizeObserver.observe(parent_element);
	});
	onDestroy(() => {
		resizeObserver.disconnect();
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
