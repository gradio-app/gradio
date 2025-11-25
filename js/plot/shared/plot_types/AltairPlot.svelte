<script lang="ts">
	//@ts-nocheck
	import { set_config } from "./altair_utils";
	import { onMount, onDestroy, untrack } from "svelte";
	import type { TopLevelSpec as Spec } from "vega-lite";
	import vegaEmbed from "vega-embed";
	import type { Gradio, SelectData } from "@gradio/utils";
	import type { View } from "vega";

	let {
		value,
		colors = [],
		caption,
		show_actions_button,
		gradio,
		_selectable,
	}: {
		value: any;
		colors?: string[];
		caption: string;
		show_actions_button: boolean;
		gradio: Gradio<{
			select: SelectData;
		}>;
		_selectable: boolean;
	} = $props();

	let element: HTMLElement;
	let parent_element: HTMLElement;
	let view: View;

	let computed_style = window.getComputedStyle(document.body);

	let old_spec: Spec = $state(null);
	let spec_width: number = $state(0);

	let plot = $derived(value?.plot);
	let spec = $derived.by(() => {
		if (!plot) return null;
		let parsed_spec = JSON.parse(plot) as Spec;

		// Filter out brush param if not selectable
		if (parsed_spec && parsed_spec.params && !_selectable) {
			parsed_spec.params = parsed_spec.params.filter(
				(param) => param.name !== "brush",
			);
		}

		untrack(() => {
			if (old_spec !== parsed_spec) {
				old_spec = parsed_spec;
				spec_width = parsed_spec.width;
			}

			if (value.chart && parsed_spec) {
				parsed_spec = set_config(
					parsed_spec,
					computed_style,
					value.chart as string,
					colors,
				);
			}
		});

		return parsed_spec;
	});

	let fit_width_to_parent = $derived(
		spec?.encoding?.column?.field ||
			spec?.encoding?.row?.field ||
			value.chart === undefined
			? false
			: true,
	);

	const get_width = (): number => {
		return Math.min(
			parent_element.offsetWidth,
			spec_width || parent_element.offsetWidth,
		);
	};
	let resize_callback = (): void => {};
	const renderPlot = (): void => {
		if (fit_width_to_parent) {
			spec.width = get_width();
		}
		vegaEmbed(element, spec, { actions: show_actions_button }).then(
			function (result): void {
				view = result.view;
				resize_callback = () => {
					view.signal("width", get_width()).run();
				};

				if (!_selectable) return;
				const callback = (event, item): void => {
					const brushValue = view.signal("brush");
					if (brushValue) {
						if (Object.keys(brushValue).length === 0) {
							gradio.dispatch("select", {
								value: null,
								index: null,
								selected: false,
							});
						} else {
							const key = Object.keys(brushValue)[0];
							let range: [number, number] = brushValue[key].map(
								(x) => x / 1000,
							);
							gradio.dispatch("select", {
								value: brushValue,
								index: range,
								selected: true,
							});
						}
					}
				};
				view.addEventListener("mouseup", callback);
				view.addEventListener("touchup", callback);
			},
		);
	};
	let resizeObserver = new ResizeObserver(() => {
		if (fit_width_to_parent && spec.width !== parent_element.offsetWidth) {
			resize_callback();
		}
	});
	onMount(() => {
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
