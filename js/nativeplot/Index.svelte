<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import { Block } from "@gradio/atoms";
	import {
		FullscreenButton,
		IconButtonWrapper,
		IconButton
	} from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import { onMount, untrack } from "svelte";
	import { Download } from "@gradio/icons";

	import type { TopLevelSpec as Spec } from "vega-lite";
	import type { View } from "vega";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import type { NativePlotProps, NativePlotEvents, PlotData } from "./types";

	let props = $props();
	const gradio = new Gradio<NativePlotEvents, NativePlotProps>(props);

	let unique_colors = $derived(
		gradio.props.color &&
			gradio.props.value &&
			gradio.props.value.datatypes[gradio.props.color] === "nominal"
			? Array.from(new Set(_data.map((d) => d[gradio.props.color!])))
			: []
	);

	let x_lim = $derived(gradio.props.x_lim || null); // for some unknown reason, x_lim was getting set to undefined when used in re-render, so this line is needed
	let y_lim = $derived(gradio.props.y_lim || null);
	let x_start = $derived(x_lim?.[0] !== null ? x_lim?.[0] : undefined);
	let x_end = $derived(x_lim?.[1] !== null ? x_lim?.[1] : undefined);
	let y_start = $derived(y_lim?.[0] !== null ? y_lim?.[0] : undefined);
	let y_end = $derived(y_lim?.[1] !== null ? y_lim?.[1] : undefined);

	let fullscreen = $state(false);

	function reformat_sort(
		_sort: NativePlotProps["sort"]
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
			return { field: gradio.props.y, order: "ascending" };
		} else if (_sort === "-y") {
			return { field: gradio.props.y, order: "descending" };
		} else if (_sort === null) {
			return null;
		} else if (Array.isArray(_sort)) {
			return _sort;
		}
	}
	let _sort = $derived(reformat_sort(gradio.props.sort));

	let _data: {
		[x: string]: string | number;
	}[] = $state([]);

	function escape_field_name(fieldName: string): string {
		// Escape special characters in field names according to Vega-Lite spec:
		// https://vega.github.io/vega-lite/docs/field.html
		return fieldName
			.replace(/\./g, "\\.")
			.replace(/\[/g, "\\[")
			.replace(/\]/g, "\\]");
	}

	let x_temporal = $derived(
		gradio.props.value &&
			gradio.props.value.datatypes[gradio.props.x] === "temporal"
	);
	let _x_lim = $derived(
		x_temporal
			? [
					x_start !== undefined ? x_start * 1000 : null,
					x_end !== undefined ? x_end * 1000 : null
				]
			: x_lim
	);
	let mouse_down_on_chart = $state(false);
	const SUFFIX_DURATION: Record<string, number> = {
		s: 1,
		m: 60,
		h: 60 * 60,
		d: 24 * 60 * 60
	};
	let _x_bin = $derived(
		gradio.props.x_bin
			? typeof gradio.props.x_bin === "string"
				? 1000 *
					parseInt(
						gradio.props.x_bin.substring(0, gradio.props.x_bin.length - 1)
					) *
					SUFFIX_DURATION[gradio.props.x_bin[gradio.props.x_bin.length - 1]]
				: gradio.props.x_bin
			: undefined
	);

	let _y_aggregate = $derived.by(() => {
		if (gradio.props.value) {
			if (gradio.props.value.mark === "point") {
				const aggregating = _x_bin !== undefined;
				return gradio.props.y_aggregate || aggregating ? "sum" : undefined;
			} else {
				return gradio.props.y_aggregate ? gradio.props.y_aggregate : "sum";
			}
		}
		return undefined;
	});

	let aggregating = $derived.by(() => {
		if (gradio.props.value) {
			if (gradio.props.value.mark === "point") {
				return _x_bin !== undefined;
			} else {
				return (
					_x_bin !== undefined ||
					gradio.props.value.datatypes[gradio.props.x] === "nominal"
				);
			}
		}
		return false;
	});

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
			gradio.props.x_bin !== null ||
			gradio.props.value?.mark !== "line" ||
			gradio.props.value?.datatypes[gradio.props.x] === "nominal"
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
		let x_index = data.columns.indexOf(gradio.props.x);
		let y_index = data.columns.indexOf(gradio.props.y);
		let color_index = gradio.props.color
			? data.columns.indexOf(gradio.props.color)
			: null;
		let datatable = data.data;

		if (x_start !== undefined && x_end !== undefined) {
			const time_factor =
				data.datatypes[gradio.props.x] === "temporal" ? 1000 : 1;
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

		if (gradio.props.tooltip == "all" || Array.isArray(gradio.props.tooltip)) {
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
				[gradio.props.x]: row[x_index],
				[gradio.props.y]: row[y_index]
			};
			if (gradio.props.color && color_index !== null) {
				obj[gradio.props.color] = row[color_index];
			}
			return obj;
		});
	}

	$effect(() => {
		console.log("effect 0 run");
		_data = gradio.props.value
			? reformat_data(gradio.props.value, x_start, x_end)
			: [];
	});

	let old_value = $state<PlotData | null>(gradio.props.value);
	$effect(() => {
		console.log("effect 1 run");
		if (old_value !== gradio.props.value && view) {
			old_value = gradio.props.value;
			view.data("data", _data).runAsync();
		}
	});

	const is_browser = typeof window !== "undefined";
	let chart_element = $state<HTMLDivElement>();
	let computed_style = $derived(
		chart_element ? window.getComputedStyle(chart_element) : null
	);
	let view = $state<View>();
	let mounted = $state(false);
	let old_width = $state<number>(0);
	let old_height = $state<number>(0);
	let resizeObserver = $state<ResizeObserver>();

	let vegaEmbed: typeof import("vega-embed").default;

	async function load_chart(): Promise<void> {
		if (mouse_down_on_chart) {
			refresh_pending = true;
			return;
		}
		if (view) {
			view.finalize();
		}
		if (!gradio.props.value || !chart_element) return;
		old_width = chart_element.offsetWidth;
		old_height = chart_element.offsetHeight;
		const spec = create_vega_lite_spec();
		if (!spec) return;
		resizeObserver = new ResizeObserver((el) => {
			if (!el[0].target || !(el[0].target instanceof HTMLElement)) return;
			if (
				old_width === 0 &&
				chart_element!.offsetWidth !== 0 &&
				gradio.props.value!.datatypes[gradio.props.x] === "nominal"
			) {
				// a bug where when a nominal chart is first loaded, the width is 0, it doesn't resize
				load_chart();
			} else {
				const width_change = Math.abs(old_width - el[0].target.offsetWidth);
				const height_change = Math.abs(old_height - el[0].target.offsetHeight);
				if (width_change > 100 || height_change > 100) {
					old_width = el[0].target.offsetWidth;
					old_height = el[0].target.offsetHeight;
					load_chart();
				} else {
					view.signal("width", el[0].target.offsetWidth).run();
					if (fullscreen) {
						view.signal("height", el[0].target.offsetHeight).run();
					}
				}
			}
		});

		if (!vegaEmbed) {
			vegaEmbed = (await import("vega-embed")).default;
		}
		vegaEmbed(chart_element, spec, { actions: false }).then(function (result) {
			view = result.view;
			resizeObserver!.observe(chart_element!);
			var debounceTimeout: NodeJS.Timeout;
			var lastSelectTime = 0;
			view.addEventListener("dblclick", () => {
				gradio.dispatch("double_click");
			});
			// prevent double-clicks from highlighting text
			chart_element!.addEventListener(
				"mousedown",
				function (e) {
					if (e.detail > 1) {
						e.preventDefault();
					}
				},
				false
			);
			if (gradio.props._selectable) {
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

	let refresh_pending = $state(false);

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

	function export_chart(): void {
		if (!view || !computed_style) return;

		const block_background = computed_style.getPropertyValue(
			"--block-background-fill"
		);
		const export_background = block_background || "white";

		view.background(export_background).run();

		view
			.toImageURL("png", 2)
			.then(function (url) {
				view.background("transparent").run();

				const link = document.createElement("a");
				link.setAttribute("href", url);
				link.setAttribute("download", "chart.png");
				link.style.display = "none";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			})
			.catch(function (err) {
				console.error("Export failed:", err);
				view.background("transparent").run();
			});
	}

	let _color_map = $derived(JSON.stringify(gradio.props.color_map));

	$effect(() => {
		// Track dependencies to trigger chart reload
		void gradio.props.title;
		void gradio.props.x_title;
		void gradio.props.y_title;
		void gradio.props.color_title;
		void gradio.props.x;
		void gradio.props.y;
		void gradio.props.color;
		void gradio.props.x_bin;
		void _y_aggregate;
		void _color_map;
		void gradio.props.colors_in_legend;
		void x_start;
		void x_end;
		void y_start;
		void y_end;
		void gradio.props.caption;
		void gradio.props.sort;
		void mounted;
		void chart_element;
		void fullscreen;
		void computed_style;

		if (mounted && chart_element) {
			console.log("Reloading chart due to prop change");
			untrack(() => {
				load_chart();
			});
		}
	});

	function create_vega_lite_spec(): Spec | null {
		if (!gradio.props.value || !computed_style) return null;
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
					labelAngle: 0,
					titleLimit: chart_element.offsetHeight * 0.8
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
					stroke: gradio.props.value.mark !== "bar" ? accent_color : undefined,
					fill: gradio.props.value.mark === "bar" ? accent_color : undefined,
					cursor: "crosshair"
				}
			},
			data: { name: "data" },
			datasets: {
				data: _data
			},
			layer: [
				"plot",
				...(gradio.props.value.mark === "line" ? ["hover"] : [])
			].map((mode) => {
				return {
					encoding: {
						size:
							gradio.props.value!.mark === "line"
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
								...(gradio.props.x_label_angle !== null && {
									labelAngle: gradio.props.x_label_angle
								}),
								labels: gradio.props.x_axis_labels_visible,
								ticks: gradio.props.x_axis_labels_visible
							},
							field: escape_field_name(gradio.props.x),
							title: gradio.props.x_title || gradio.props.x,
							type: gradio.props.value!.datatypes[gradio.props.x],
							scale: {
								zero: false,
								domainMin: _x_lim?.[0] !== null ? _x_lim?.[0] : undefined,
								domainMax: _x_lim?.[1] !== null ? _x_lim?.[1] : undefined
							},
							bin: _x_bin ? { step: _x_bin } : undefined,
							sort: _sort
						},
						y: {
							axis: gradio.props.y_label_angle
								? { labelAngle: gradio.props.y_label_angle }
								: {},
							field: escape_field_name(gradio.props.y),
							title: gradio.props.y_title || gradio.props.y,
							type: gradio.props.value!.datatypes[gradio.props.y],
							scale: {
								zero: false,
								domainMin: y_start ?? undefined,
								domainMax: y_end ?? undefined
							},
							aggregate: aggregating ? _y_aggregate : undefined
						},
						color: gradio.props.color
							? {
									field: escape_field_name(gradio.props.color),
									legend: {
										orient: "bottom",
										title: gradio.props.color_title,
										values: gradio.props.colors_in_legend || undefined
									},
									scale:
										gradio.props.value!.datatypes[gradio.props.color] ===
										"nominal"
											? {
													domain: unique_colors,
													range: gradio.props.color_map
														? unique_colors.map(
																(c) => gradio.props.color_map![c]
															)
														: undefined
												}
											: {
													range: [
														100, 200, 300, 400, 500, 600, 700, 800, 900
													].map((n) =>
														computed_style!.getPropertyValue("--primary-" + n)
													),
													interpolate: "hsl"
												},
									type: gradio.props.value!.datatypes[gradio.props.color]
								}
							: undefined,
						tooltip:
							gradio.props.tooltip == "none"
								? undefined
								: [
										{
											field: escape_field_name(gradio.props.y),
											type: gradio.props.value!.datatypes[gradio.props.y],
											aggregate: aggregating ? _y_aggregate : undefined,
											title: gradio.props.y_title || gradio.props.y
										},
										{
											field: escape_field_name(gradio.props.x),
											type: gradio.props.value!.datatypes[gradio.props.x],
											title: gradio.props.x_title || gradio.props.x,
											format: x_temporal ? "%Y-%m-%d %H:%M:%S" : undefined,
											bin: _x_bin ? { step: _x_bin } : undefined
										},
										...(gradio.props.color
											? [
													{
														field: gradio.props.color,
														type: gradio.props.value!.datatypes[
															gradio.props.color
														]
													}
												]
											: []),
										...(gradio.props.tooltip === "axis"
											? []
											: gradio.props.value?.columns
													.filter(
														(col) =>
															col !== gradio.props.x &&
															col !== gradio.props.y &&
															col !== gradio.props.color &&
															(gradio.props.tooltip === "all" ||
																gradio.props.tooltip.includes(col))
													)
													.map((column) => ({
														field: column,
														type: gradio.props.value!.datatypes[column]
													})))
									]
					},
					strokeDash: {},
					mark: {
						clip: true,
						type: mode === "hover" ? "point" : gradio.props.value.mark
					},
					name: mode
				};
			}),
			// @ts-ignore
			params: [
				...(gradio.props.value!.mark === "line"
					? [
							{
								name: "hoverPlot",
								select: {
									clear: "mouseout",
									fields: gradio.props.color ? [gradio.props.color] : [],
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
				...(gradio.props._selectable
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
			width: chart_element!.offsetWidth,
			height: gradio.props.height || fullscreen ? "container" : undefined,
			title: gradio.props.title || undefined
		} as Spec;
	}
	/* eslint-enable complexity */
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	padding={true}
	height={gradio.props.height}
	bind:fullscreen
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}
	{#if gradio.props.buttons?.length}
		<IconButtonWrapper>
			{#if gradio.props.buttons?.includes("export")}
				<IconButton Icon={Download} label="Export" on:click={export_chart} />
			{/if}
			{#if gradio.props.buttons?.includes("fullscreen")}
				<FullscreenButton
					{fullscreen}
					on:fullscreen={({ detail }) => {
						fullscreen = detail;
					}}
				/>
			{/if}
		</IconButtonWrapper>
	{/if}
	<BlockTitle show_label={gradio.props.show_label} info={undefined}
		>{gradio.props.label}</BlockTitle
	>

	{#if gradio.props.value && is_browser}
		<div bind:this={chart_element}></div>

		{#if gradio.props.caption}
			<p class="caption">{gradio.props.caption}</p>
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
