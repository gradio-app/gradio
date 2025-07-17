<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import { Block } from "@gradio/atoms";
	import { FullscreenButton, IconButtonWrapper } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { onMount } from "svelte";

	import type { TopLevelSpec as Spec } from "vega-lite";
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
	export let y_lim: [number | null, number | null] | null = null;
	$: x_lim = x_lim || null; // for some unknown reason, x_lim was getting set to undefined when used in re-render, so this line is needed
	$: y_lim = y_lim || null;
	$: [x_start, x_end] = x_lim === null ? [undefined, undefined] : x_lim;
	$: [y_start, y_end] = y_lim || [undefined, undefined];
	export let x_label_angle: number | null = null;
	export let y_label_angle: number | null = null;
	export let x_axis_labels_visible = true;
	export let caption: string | null = null;
	export let sort: "x" | "y" | "-x" | "-y" | string[] | null = null;
	export let tooltip: "axis" | "none" | "all" | string[] = "axis";
	export let show_fullscreen_button = false;
	let fullscreen = false;

	function reformat_sort(
		_sort: typeof sort
	):
		| string
		| "ascending"
		| "descending"
		| { field: string; order: "ascending" | "descending" }
		| string[]
		| null
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
			return null;
		} else if (Array.isArray(_sort)) {
			return _sort;
		}
	}
	$: _sort = reformat_sort(sort);
	export let _selectable = false;
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

	function downsample(
		data: PlotData["data"],
		x_index: number,
		y_index: number,
		color_index: number | null,
		x_start: number | undefined,
		x_end: number | undefined
	): PlotData["data"] {
		if (
			data.length < 1000 ||
			x_bin !== null ||
			value?.mark !== "line" ||
			value?.datatypes[x] === "nominal"
		) {
			return data;
		}
		const bin_count = 250;
		let min_max_bins_per_color: Record<
			string,
			[number | null, number, number | null, number][]
		> = {};
		if (x_start === undefined || x_end === undefined) {
			data.forEach((row) => {
				let x_value = row[x_index] as number;
				if (x_start === undefined || x_value < x_start) {
					x_start = x_value;
				}
				if (x_end === undefined || x_value > x_end) {
					x_end = x_value;
				}
			});
		}
		if (x_start === undefined || x_end === undefined) {
			return data;
		}
		const x_range = x_end - x_start;
		const bin_size = x_range / bin_count;
		data.forEach((row, i) => {
			const x_value = row[x_index] as number;
			const y_value = row[y_index] as number;
			const color_value =
				color_index !== null ? (row[color_index] as string) : "any";
			const bin_index = Math.floor((x_value - (x_start as number)) / bin_size);
			if (min_max_bins_per_color[color_value] === undefined) {
				min_max_bins_per_color[color_value] = [];
			}
			min_max_bins_per_color[color_value][bin_index] = min_max_bins_per_color[
				color_value
			][bin_index] || [
				null,
				Number.POSITIVE_INFINITY,
				null,
				Number.NEGATIVE_INFINITY
			];
			if (y_value < min_max_bins_per_color[color_value][bin_index][1]) {
				min_max_bins_per_color[color_value][bin_index][0] = i;
				min_max_bins_per_color[color_value][bin_index][1] = y_value;
			}
			if (y_value > min_max_bins_per_color[color_value][bin_index][3]) {
				min_max_bins_per_color[color_value][bin_index][2] = i;
				min_max_bins_per_color[color_value][bin_index][3] = y_value;
			}
		});
		const downsampled_data: PlotData["data"] = [];
		Object.values(min_max_bins_per_color).forEach((bins) => {
			bins.forEach(([min_index, _, max_index, __]) => {
				let indices: number[] = [];
				if (min_index !== null && max_index !== null) {
					indices = [
						Math.min(min_index, max_index),
						Math.max(min_index, max_index)
					];
				} else if (min_index !== null) {
					indices = [min_index];
				} else if (max_index !== null) {
					indices = [max_index];
				}
				indices.forEach((index) => {
					downsampled_data.push(data[index]);
				});
			});
		});
		return downsampled_data;
	}
	function reformat_data(
		data: PlotData,
		x_start: number | undefined,
		x_end: number | undefined
	): {
		[x: string]: string | number;
	}[] {
		let x_index = data.columns.indexOf(x);
		let y_index = data.columns.indexOf(y);
		let color_index = color ? data.columns.indexOf(color) : null;
		let datatable = data.data;

		if (x_start !== undefined && x_end !== undefined) {
			const time_factor = data.datatypes[x] === "temporal" ? 1000 : 1;
			const _x_start = x_start * time_factor;
			const _x_end = x_end * time_factor;
			let largest_before_start: Record<string, [number, number]> = {};
			let smallest_after_end: Record<string, [number, number]> = {};
			const _datatable = datatable.filter((row, i) => {
				const x_value = row[x_index] as number;
				const color_value =
					color_index !== null ? (row[color_index] as string) : "any";
				if (
					x_value < _x_start &&
					(largest_before_start[color_value] === undefined ||
						x_value > largest_before_start[color_value][1])
				) {
					largest_before_start[color_value] = [i, x_value];
				}
				if (
					x_value > _x_end &&
					(smallest_after_end[color_value] === undefined ||
						x_value < smallest_after_end[color_value][1])
				) {
					smallest_after_end[color_value] = [i, x_value];
				}
				return x_value >= _x_start && x_value <= _x_end;
			});
			datatable = [
				...Object.values(largest_before_start).map(([i, _]) => datatable[i]),
				...downsample(
					_datatable,
					x_index,
					y_index,
					color_index,
					_x_start,
					_x_end
				),
				...Object.values(smallest_after_end).map(([i, _]) => datatable[i])
			];
		} else {
			datatable = downsample(
				datatable,
				x_index,
				y_index,
				color_index,
				undefined,
				undefined
			);
		}

		if (tooltip == "all" || Array.isArray(tooltip)) {
			return datatable.map((row) => {
				const obj: { [x: string]: string | number } = {};
				data.columns.forEach((col, i) => {
					obj[col] = row[i];
				});
				return obj;
			});
		}
		return datatable.map((row) => {
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
	$: _data = value ? reformat_data(value, x_start, x_end) : [];
	let old_value = value;
	$: if (old_value !== value && view) {
		old_value = value;
		view.data("data", _data).runAsync();
	}

	const is_browser = typeof window !== "undefined";
	let chart_element: HTMLDivElement;
	$: computed_style = chart_element
		? window.getComputedStyle(chart_element)
		: null;
	let view: View;
	let mounted = false;
	let old_width: number;
	let old_height: number;
	let resizeObserver: ResizeObserver;

	let vegaEmbed: typeof import("vega-embed").default;
	async function load_chart(): Promise<void> {
		if (mouse_down_on_chart) {
			refresh_pending = true;
			return;
		}
		if (view) {
			view.finalize();
		}
		if (!value || !chart_element) return;
		old_width = chart_element.offsetWidth;
		old_height = chart_element.offsetHeight;
		const spec = create_vega_lite_spec();
		if (!spec) return;
		resizeObserver = new ResizeObserver((el) => {
			if (!el[0].target || !(el[0].target instanceof HTMLElement)) return;
			if (
				old_width === 0 &&
				chart_element.offsetWidth !== 0 &&
				value.datatypes[x] === "nominal"
			) {
				// a bug where when a nominal chart is first loaded, the width is 0, it doesn't resize
				load_chart();
			} else {
				view.signal("width", el[0].target.offsetWidth).run();
			}
			if (old_height !== el[0].target.offsetHeight && fullscreen) {
				view.signal("height", el[0].target.offsetHeight).run();
				old_height = el[0].target.offsetHeight;
			}
		});

		if (!vegaEmbed) {
			vegaEmbed = (await import("vega-embed")).default;
		}
		vegaEmbed(chart_element, spec, { actions: false }).then(function (result) {
			view = result.view;

			resizeObserver.observe(chart_element);
			var debounceTimeout: NodeJS.Timeout;
			var lastSelectTime = 0;
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
					if (Date.now() - lastSelectTime < 1000) return;
					mouse_down_on_chart = true;
					if (Object.keys(value).length === 0) return;
					clearTimeout(debounceTimeout);
					let range: [number, number] = value[Object.keys(value)[0]];
					if (x_temporal) {
						range = [range[0] / 1000, range[1] / 1000];
					}
					debounceTimeout = setTimeout(function () {
						mouse_down_on_chart = false;
						lastSelectTime = Date.now();
						gradio.dispatch("select", {
							value: range,
							index: range,
							selected: true
						});
						if (refresh_pending) {
							refresh_pending = false;
							load_chart();
						}
					}, 250);
				});
			}
		});
	}

	let refresh_pending = false;
	onMount(() => {
		mounted = true;
		return () => {
			mounted = false;
			if (view) {
				view.finalize();
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});
	$: _color_map = JSON.stringify(color_map);

	$: title,
		x_title,
		y_title,
		color_title,
		x,
		y,
		color,
		x_bin,
		_y_aggregate,
		_color_map,
		x_start,
		x_end,
		y_start,
		y_end,
		caption,
		sort,
		mounted,
		chart_element,
		fullscreen,
		computed_style && requestAnimationFrame(load_chart);

	function create_vega_lite_spec(): Spec | null {
		if (!value || !computed_style) return null;
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
								axis: {
									...(x_label_angle !== null && { labelAngle: x_label_angle }),
									labels: x_axis_labels_visible,
									ticks: x_axis_labels_visible
								},
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
								scale: {
									zero: false,
									domainMin: y_start ?? undefined,
									domainMax: y_end ?? undefined
								},
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
							tooltip:
								tooltip == "none"
									? undefined
									: [
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
												: []),
											...(tooltip === "axis"
												? []
												: value?.columns
														.filter(
															(col) =>
																col !== x &&
																col !== y &&
																col !== color &&
																(tooltip === "all" || tooltip.includes(col))
														)
														.map((column) => ({
															field: column,
															type: value.datatypes[column]
														})))
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
			height: height || fullscreen ? "container" : undefined,
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
	bind:fullscreen
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}
	{#if show_fullscreen_button}
		<IconButtonWrapper>
			<FullscreenButton
				{fullscreen}
				on:fullscreen={({ detail }) => {
					fullscreen = detail;
				}}
			/>
		</IconButtonWrapper>
	{/if}
	<BlockTitle {show_label} info={undefined}>{label}</BlockTitle>

	{#if value && is_browser}
		<div bind:this={chart_element}></div>

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
		height: 100%;
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
