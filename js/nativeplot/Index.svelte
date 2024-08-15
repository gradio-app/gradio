<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { onMount } from "svelte";

	import type { TopLevelSpec as Spec } from "vega-lite";
	import vegaEmbed from "vega-embed";
	import type { View } from "vega";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";

	interface PlotData {
		columns: string[];
		data: [string | number][];
		datatypes: Record<string, "quantitative" | "temporal" | "nominal">;
		mark: "line" | "point" | "bar";
	}
	export let value: PlotData | null;
	export let x: string;
	export let y: string;
	export let color: string | null = null;
	$: unique_colors =
		color && value && value.datatypes[color] === "nominal"
			? Array.from(new Set(_data.map((d) => d[color])))
			: [];

	export let title: string | null = null;
	export let x_title: string | null = null;
	export let y_title: string | null = null;
	export let color_title: string | null = null;
	export let x_bin: string | number | null = null;
	export let y_aggregate:
		| "sum"
		| "mean"
		| "median"
		| "min"
		| "max"
		| undefined = undefined;
	export let color_map: Record<string, string> | null = null;
	export let x_lim: [number, number] | null = null;
	export let y_lim: [number, number] | null = null;
	export let x_label_angle: number | null = null;
	export let y_label_angle: number | null = null;
	export let caption: string | null = null;
	export let sort: "x" | "y" | "-x" | "-y" | string[] | null = null;
	function reformat_sort(
		_sort: typeof sort
	):
		| string
		| "ascending"
		| "descending"
		| { field: string; order: "ascending" | "descending" }
		| string[]
		| undefined {
		if (_sort === "x") {
			return "ascending";
		} else if (_sort === "-x") {
			return "descending";
		} else if (_sort === "y") {
			return { field: y, order: "ascending" };
		} else if (_sort === "-y") {
			return { field: y, order: "descending" };
		} else if (_sort === null) {
			return undefined;
		} else if (Array.isArray(_sort)) {
			return _sort;
		}
	}
	$: _sort = reformat_sort(sort);
	export let _selectable = false;
	export let target: HTMLDivElement;
	let _data: {
		[x: string]: string | number;
	}[];
	export let gradio: Gradio<{
		select: SelectData;
		double_click: undefined;
		clear_status: LoadingStatus;
	}>;

	$: x_temporal = value && value.datatypes[x] === "temporal";
	$: _x_lim = x_lim && x_temporal ? [x_lim[0] * 1000, x_lim[1] * 1000] : x_lim;
	let _x_bin: number | undefined;
	let mouse_down_on_chart = false;
	const SUFFIX_DURATION: Record<string, number> = {
		s: 1,
		m: 60,
		h: 60 * 60,
		d: 24 * 60 * 60
	};
	$: _x_bin = x_bin
		? typeof x_bin === "string"
			? 1000 *
				parseInt(x_bin.substring(0, x_bin.length - 1)) *
				SUFFIX_DURATION[x_bin[x_bin.length - 1]]
			: x_bin
		: undefined;
	let _y_aggregate: typeof y_aggregate;
	let aggregating: boolean;
	$: {
		if (value) {
			if (value.mark === "point") {
				aggregating = _x_bin !== undefined;
				_y_aggregate = y_aggregate || aggregating ? "sum" : undefined;
			} else {
				aggregating = _x_bin !== undefined || value.datatypes[x] === "nominal";
				_y_aggregate = y_aggregate ? y_aggregate : "sum";
			}
		}
	}
	function reformat_data(data: PlotData): {
		[x: string]: string | number;
	}[] {
		let x_index = data.columns.indexOf(x);
		let y_index = data.columns.indexOf(y);
		let color_index = color ? data.columns.indexOf(color) : null;
		return data.data.map((row) => {
			const obj = {
				[x]: row[x_index],
				[y]: row[y_index]
			};
			if (color && color_index !== null) {
				obj[color] = row[color_index];
			}
			return obj;
		});
	}
	$: _data = value ? reformat_data(value) : [];

	let chart_element: HTMLDivElement;
	let computed_style = window.getComputedStyle(target);
	let view: View;
	let mounted = false;
	let old_width: number;

	function load_chart(): void {
		if (view) {
			view.finalize();
		}
		if (!value) return;
		old_width = chart_element.offsetWidth;
		const spec = create_vega_lite_spec();
		if (!spec) return;
		let resizeObserver = new ResizeObserver(() => {
			if (
				old_width === 0 &&
				chart_element.offsetWidth !== 0 &&
				value.datatypes[x] === "nominal"
			) {
				// a bug where when a nominal chart is first loaded, the width is 0, it doesn't resize
				load_chart();
			} else {
				view.signal("width", chart_element.offsetWidth).run();
			}
		});
		vegaEmbed(chart_element, spec, { actions: false }).then(function (result) {
			view = result.view;
			resizeObserver.observe(chart_element);
			var debounceTimeout: NodeJS.Timeout;
			view.addEventListener("dblclick", () => {
				gradio.dispatch("double_click");
			});
			// prevent double-clicks from highlighting text
			chart_element.addEventListener(
				"mousedown",
				function (e) {
					if (e.detail > 1) {
						e.preventDefault();
					}
				},
				false
			);
			if (_selectable) {
				view.addSignalListener("brush", function (_, value) {
					if (Object.keys(value).length === 0) return;
					clearTimeout(debounceTimeout);
					let range: [number, number] = value[Object.keys(value)[0]];
					if (x_temporal) {
						range = [range[0] / 1000, range[1] / 1000];
					}
					let callback = (): void => {
						gradio.dispatch("select", {
							value: range,
							index: range,
							selected: true
						});
					};
					if (mouse_down_on_chart) {
						release_callback = callback;
					} else {
						debounceTimeout = setTimeout(function () {
							gradio.dispatch("select", {
								value: range,
								index: range,
								selected: true
							});
						}, 250);
					}
				});
			}
		});
	}

	let release_callback: (() => void) | null = null;
	onMount(() => {
		mounted = true;
		chart_element.addEventListener("mousedown", () => {
			mouse_down_on_chart = true;
		});
		chart_element.addEventListener("mouseup", () => {
			mouse_down_on_chart = false;
			if (release_callback) {
				release_callback();
				release_callback = null;
			}
		});
	});

	$: title,
		x_title,
		y_title,
		color_title,
		x,
		y,
		color,
		x_bin,
		_y_aggregate,
		color_map,
		x_lim,
		y_lim,
		caption,
		sort,
		value,
		mounted && load_chart();

	function create_vega_lite_spec(): Spec | null {
		if (!value) return null;
		let accent_color = computed_style.getPropertyValue("--color-accent");
		let body_text_color = computed_style.getPropertyValue("--body-text-color");
		let borderColorPrimary = computed_style.getPropertyValue(
			"--border-color-primary"
		);
		let font_family = computed_style.fontFamily;
		let title_weight = computed_style.getPropertyValue(
			"--block-title-text-weight"
		) as
			| "bold"
			| "normal"
			| 100
			| 200
			| 300
			| 400
			| 500
			| 600
			| 700
			| 800
			| 900;
		const font_to_px_val = (font: string): number => {
			return font.endsWith("px") ? parseFloat(font.slice(0, -2)) : 12;
		};
		let text_size_md = font_to_px_val(
			computed_style.getPropertyValue("--text-md")
		);
		let text_size_sm = font_to_px_val(
			computed_style.getPropertyValue("--text-sm")
		);

		/* eslint-disable complexity */
		return {
			$schema: "https://vega.github.io/schema/vega-lite/v5.17.0.json",
			background: "transparent",
			config: {
				autosize: { type: "fit", contains: "padding" },
				axis: {
					labelFont: font_family,
					labelColor: body_text_color,
					titleFont: font_family,
					titleColor: body_text_color,
					titlePadding: 8,
					tickColor: borderColorPrimary,
					labelFontSize: text_size_sm,
					gridColor: borderColorPrimary,
					titleFontWeight: "normal",
					titleFontSize: text_size_sm,
					labelFontWeight: "normal",
					domain: false,
					labelAngle: 0
				},
				legend: {
					labelColor: body_text_color,
					labelFont: font_family,
					titleColor: body_text_color,
					titleFont: font_family,
					titleFontWeight: "normal",
					titleFontSize: text_size_sm,
					labelFontWeight: "normal",
					offset: 2
				},
				title: {
					color: body_text_color,
					font: font_family,
					fontSize: text_size_md,
					fontWeight: title_weight,
					anchor: "middle"
				},
				view: { stroke: borderColorPrimary },
				mark: {
					stroke: value.mark !== "bar" ? accent_color : undefined,
					fill: value.mark === "bar" ? accent_color : undefined,
					cursor: "crosshair"
				}
			},
			data: { name: "data" },
			datasets: {
				data: _data
			},
			layer: ["plot", ...(value.mark === "line" ? ["hover"] : [])].map(
				(mode) => {
					return {
						encoding: {
							size:
								value.mark === "line"
									? mode == "plot"
										? {
												condition: {
													empty: false,
													param: "hoverPlot",
													value: 3
												},
												value: 2
											}
										: {
												condition: { empty: false, param: "hover", value: 100 },
												value: 0
											}
									: undefined,
							opacity:
								mode === "plot"
									? undefined
									: {
											condition: { empty: false, param: "hover", value: 1 },
											value: 0
										},
							x: {
								axis: x_label_angle ? { labelAngle: x_label_angle } : {},
								field: x,
								title: x_title || x,
								type: value.datatypes[x],
								scale: _x_lim ? { domain: _x_lim } : undefined,
								bin: _x_bin ? { step: _x_bin } : undefined,
								sort: _sort
							},
							y: {
								axis: y_label_angle ? { labelAngle: y_label_angle } : {},
								field: y,
								title: y_title || y,
								type: value.datatypes[y],
								scale: y_lim ? { domain: y_lim } : undefined,
								aggregate: aggregating ? _y_aggregate : undefined
							},
							color: color
								? {
										field: color,
										legend: { orient: "bottom", title: color_title },
										scale:
											value.datatypes[color] === "nominal"
												? {
														domain: unique_colors,
														range: color_map
															? unique_colors.map((c) => color_map[c])
															: undefined
													}
												: {
														range: [
															100, 200, 300, 400, 500, 600, 700, 800, 900
														].map((n) =>
															computed_style.getPropertyValue("--primary-" + n)
														),
														interpolate: "hsl"
													},
										type: value.datatypes[color]
									}
								: undefined,
							tooltip: [
								{
									field: y,
									type: value.datatypes[y],
									aggregate: aggregating ? _y_aggregate : undefined,
									title: y_title || y
								},
								{
									field: x,
									type: value.datatypes[x],
									title: x_title || x,
									format: x_temporal ? "%Y-%m-%d %H:%M:%S" : undefined,
									bin: _x_bin ? { step: _x_bin } : undefined
								},
								...(color
									? [
											{
												field: color,
												type: value.datatypes[color]
											}
										]
									: [])
							]
						},
						strokeDash: {},
						mark: { clip: true, type: mode === "hover" ? "point" : value.mark },
						name: mode
					};
				}
			),
			// @ts-ignore
			params: [
				...(value.mark === "line"
					? [
							{
								name: "hoverPlot",
								select: {
									clear: "mouseout",
									fields: color ? [color] : [],
									nearest: true,
									on: "mouseover",
									type: "point" as "point"
								},
								views: ["hover"]
							},
							{
								name: "hover",
								select: {
									clear: "mouseout",
									nearest: true,
									on: "mouseover",
									type: "point" as "point"
								},
								views: ["hover"]
							}
						]
					: []),
				...(_selectable
					? [
							{
								name: "brush",
								select: {
									encodings: ["x"],
									mark: { fill: "gray", fillOpacity: 0.3, stroke: "none" },
									type: "interval" as "interval"
								},
								views: ["plot"]
							}
						]
					: [])
			],
			width: chart_element.offsetWidth,
			title: title || undefined
		};
		/* eslint-enable complexity */
	}

	export let label = "Textbox";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let show_label: boolean;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let height: number | undefined = undefined;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={true}
	{height}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}
	<BlockTitle {show_label} info={undefined}>{label}</BlockTitle>
	<div bind:this={chart_element}></div>
	{#if value}
		{#if caption}
			<p class="caption">{caption}</p>
		{/if}
	{:else}
		<Empty unpadded_box={true}><LabelIcon /></Empty>
	{/if}
</Block>

<style>
	div {
		width: 100%;
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
	.caption {
		padding: 0 4px;
		margin: 0;
		text-align: center;
	}
</style>
