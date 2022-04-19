<script lang="ts">
	import { csvParse } from "d3-dsv";
	import { scaleLinear } from "d3-scale";
	import { line as _line, curveLinear } from "d3-shape";
	import { createEventDispatcher, onMount } from "svelte";

	import { get_domains, transform_values, get_color } from "./utils";
	import { tooltip } from "@gradio/tooltip";

	export let value: string | Array<Record<string, string>>;
	export let x: string | undefined = undefined;
	export let y: Array<string> | undefined = undefined;

	export let style: string = "";

	const dispatch = createEventDispatcher();

	$: ({ x: _x, y: _y } =
		typeof value === "string"
			? transform_values(csvParse(value) as Array<Record<string, string>>, x, y)
			: transform_values(value, x, y));

	$: x_domain = get_domains(_x);
	$: y_domain = get_domains(_y);

	$: scale_x = scaleLinear(x_domain, [0, 600]).nice();
	$: scale_y = scaleLinear(y_domain, [350, 0]).nice();
	$: x_ticks = scale_x.ticks(8);
	$: y_ticks = scale_y.ticks(y_domain[1] < 10 ? y_domain[1] : 8);

	let colors: Record<string, string>;
	$: colors = _y.reduce(
		(acc, next) => ({ ...acc, [next.name]: get_color() }),
		{}
	);

	onMount(() => {
		dispatch("process", { x: _x, y: _y });
	});
</script>

<div>
	<div class="flex justify-center align-items-center text-sm">
		{#each _y as { name }}
			<div class="mx-2">
				<span
					class="inline-block w-[10px] h-[10px]"
					style="background-color: {colors[name]}"
				/>
				{name}
			</div>
		{/each}
	</div>
	<svg class="w-full" viewBox="-70 -20 700 420">
		<g>
			{#each x_ticks as tick}
				<line
					stroke-width="0.5"
					x1={scale_x(tick)}
					x2={scale_x(tick)}
					y1={scale_y(y_ticks[0] < y_domain[0] ? y_ticks[0] : y_domain[0]) + 10}
					y2={scale_y(
						y_domain[1] > y_ticks[y_ticks.length - 1]
							? y_domain[1]
							: y_ticks[y_ticks.length - 1]
					)}
					stroke="#aaa"
				/>
				<text
					class="font-mono text-xs"
					text-anchor="middle"
					x={scale_x(tick)}
					y={scale_y(y_ticks[0]) + 30}
				>
					{tick}
				</text>
			{/each}

			{#each y_ticks as tick}
				<line
					stroke-width="0.5"
					y1={scale_y(tick)}
					y2={scale_y(tick)}
					x1={scale_x(x_ticks[0] < x_domain[0] ? x_ticks[0] : x_domain[0]) - 10}
					x2={scale_x(
						x_domain[1] > x_ticks[x_ticks.length - 1]
							? x_domain[1]
							: x_ticks[x_ticks.length - 1]
					)}
					stroke="#aaa"
				/>

				<text
					class="font-mono text-xs"
					text-anchor="end"
					y={scale_y(tick) + 4}
					x={scale_x(x_ticks[0]) - 20}
				>
					{tick}
				</text>
			{/each}

			{#if y_domain[1] > y_ticks[y_ticks.length - 1]}
				<line
					stroke-width="0.5"
					y1={scale_y(y_domain[1])}
					y2={scale_y(y_domain[1])}
					x1={scale_x(x_ticks[0])}
					x2={scale_x(x_domain[1])}
					stroke="#aaa"
				/>
				<text
					class="font-mono text-xs"
					text-anchor="end"
					y={scale_y(y_domain[1]) + 4}
					x={scale_x(x_ticks[0]) - 20}
				>
					{y_domain[1]}
				</text>
			{/if}
		</g>

		{#each _y as { name, values }}
			{@const color = colors[name]}
			{#each values as { x, y }}
				<circle
					r="3.5"
					cx={scale_x(x)}
					cy={scale_y(y)}
					stroke-width="1.5"
					stroke={color}
					fill="none"
				/>
			{/each}
			<path
				d={_line().curve(curveLinear)(
					values.map(({ x, y }) => [scale_x(x), scale_y(y)])
				)}
				fill="none"
				stroke={color}
				stroke-width="3"
			/>
		{/each}

		{#each _y as { name, values }}
			{@const color = colors[name]}
			{#each values as { x, y }}
				<circle
					use:tooltip={{ color, text: `(${x}, ${y})` }}
					r="7"
					cx={scale_x(x)}
					cy={scale_y(y)}
					stroke="black"
					fill="black"
					style="cursor: pointer; opacity: 0"
				/>
			{/each}
		{/each}
	</svg>

	<div class="flex justify-center align-items-center text-sm">
		{_x.name}
	</div>
</div>
