<script lang="ts">
	const browser = typeof document !== "undefined";
	import { colors } from "@gradio/theme";
	import { get_next_color } from "@gradio/utils";

	export let value: Array<[string, string | number]> = [];
	export let show_legend: boolean = false;
	export let color_map: Record<string, string> = {};

	let ctx: CanvasRenderingContext2D;

	let _color_map: Record<string, { primary: string; secondary: string }> = {};
	let active = "";

	function name_to_rgba(name: string, a: number) {
		if (!ctx) {
			var canvas = document.createElement("canvas");
			ctx = canvas.getContext("2d")!;
		}
		ctx.fillStyle = name;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		ctx.clearRect(0, 0, 1, 1);
		return `rgba(${r}, ${g}, ${b}, ${255 / a})`;
	}

	let mode: "categories" | "scores";

	$: {
		if (!color_map) {
			color_map = {};
		}
		if (value.length > 0) {
			for (let [_, label] of value) {
				if (label !== null) {
					if (typeof label === "string") {
						mode = "categories";
						if (!(label in color_map)) {
							let color = get_next_color(Object.keys(color_map).length);
							color_map[label] = color;
						}
					} else {
						mode = "scores";
					}
				}
			}
		}
		function correct_color_map() {
			for (const col in color_map) {
				const _c = color_map[col].trim();
				if (_c in colors) {
					_color_map[col] = colors[_c as keyof typeof colors];
				} else {
					_color_map[col] = {
						primary: browser ? name_to_rgba(color_map[col], 1) : color_map[col],
						secondary: browser
							? name_to_rgba(color_map[col], 0.5)
							: color_map[col]
					};
				}
			}
		}

		correct_color_map();
	}

	function handle_mouseover(label: string) {
		active = label;
	}
	function handle_mouseout() {
		active = "";
	}
</script>

<!-- 
	@todo victor: try reimplementing without flex (negative margins on container to avoid left margin on linebreak). 
	If not possible hijack the copy execution like this:

<svelte:window
	on:copy|preventDefault={() => {
		const selection =.getSelection()?.toString();
		console.log(selection?.replaceAll("\n", " "));
	}}
/>
-->

{#if mode === "categories"}
	{#if show_legend}
		<div class="category-legend" data-testid="highlighted-text:category-legend">
			{#each Object.entries(_color_map) as [category, color], i}
				<div
					on:mouseover={() => handle_mouseover(category)}
					on:focus={() => handle_mouseover(category)}
					on:mouseout={() => handle_mouseout()}
					on:blur={() => handle_mouseout()}
					class="category-label"
					style={"background-color:" + color.secondary}
				>
					{category}
				</div>
			{/each}
		</div>
	{/if}
	<div class="textfield">
		{#each value as [text, category]}
			<span
				class="textspan"
				style:background-color={category === null ||
				(active && active !== category)
					? ""
					: _color_map[category].secondary}
				class:no-cat={category === null || (active && active !== category)}
				class:hl={category !== null}
			>
				<span class:no-label={!_color_map[category]} class="text">{text}</span>
				{#if !show_legend && category !== null}
					&nbsp;<span
						class="label"
						style:background-color={category === null ||
						(active && active !== category)
							? ""
							: _color_map[category].primary}
					>
						{category}
					</span>
				{/if}
			</span>
		{/each}
	</div>
{:else}
	{#if show_legend}
		<div class="color-legend" data-testid="highlighted-text:color-legend">
			<span>-1</span>
			<span>0</span>
			<span>+1</span>
		</div>
	{/if}
	<div class="textfield" data-testid="highlighted-text:textfield">
		{#each value as [text, score]}
			<span
				class="textspan score-text"
				style={"background-color: rgba(" +
					(score < 0 ? "128, 90, 213," + -score : "239, 68, 60," + score) +
					")"}
			>
				<span class="text">{text}</span>
			</span>
		{/each}
	</div>
{/if}

<style>
	.hl + .hl {
		margin-left: var(--size-1);
	}

	.textspan:last-child > .label {
		margin-right: 0;
	}

	.category-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);
		margin-bottom: var(--size-2);
		margin-top: var(--size-7);
		color: black;
	}

	.category-label {
		padding-right: var(--size-2);
		padding-left: var(--size-2);
		border-radius: var(--highlighted_text-outer-border-radius);
		cursor: pointer;
		font-weight: var(--weight-semibold);
	}

	.color-legend {
		/* background: -webkit-linear-gradient(to right,#8d83d6,black,#eb4d4b);  */
		background: linear-gradient(
			to right,
			var(--color-purple),
			rgba(255, 255, 255, 0),
			var(--color-red)
		);
		display: flex;
		justify-content: space-between;
		border-radius: var(--highlighted_text-outer-border-radius);
		margin-bottom: var(--size-3);
		margin-top: var(--size-7);
		font-weight: var(--weight-semibold);
		padding: var(--size-1) var(--size-2);
	}

	.textfield {
		background: var(--color-background-primary);
		background-color: transparent;
		box-sizing: border-box;
		border-radius: var(--highlighted_text-outer-border-radius);
		max-width: var(--size-full);
		word-break: break-all;
		line-height: var(--scale-4);
		margin-top: var(--size-7);
		font-size: var(--scale-00);
	}

	.textspan {
		border-radius: var(--highlighted_text-outer-border-radius);
		padding-left: var(--size-1);
		padding-right: var(--size-1);
		transition: 150ms;
		padding-bottom: 3.5px;
		padding-top: 2.5px;
		color: black;
	}

	.label {
		margin-right: calc(var(--size-1) * -1);
		font-weight: var(--weight-bold);
		text-transform: uppercase;
		font-size: var(--scale-000);
		color: var(--color-text-body);
		border-radius: var(--highlighted_text-inner-border-radius);
		padding: 1px 5px;
		margin-top: 1px;
		transition: 150ms;
		color: white;
	}

	.text {
		/* dark:text-white */
		color: black;
	}

	.score-text .text {
		color: var(--color-text-body);
	}

	.score-text {
		padding: var(--size-1);
		margin-right: var(--size-1);
	}

	.no-cat {
		color: var(--color-text-body);
	}

	.no-label {
		color: var(--color-text-body);
	}
</style>
