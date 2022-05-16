<script lang="ts">
	const browser = typeof document !== "undefined";
	import { colors, ordered_colors } from "@gradio/theme";
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

	if (color_map === null) {
		color_map = {};
	}

	$: {
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
		<div class="category-legend flex flex-wrap gap-1 mb-2 text-black mt-7">
			{#each Object.entries(_color_map) as [category, color], i}
				<div
					on:mouseover={() => handle_mouseover(category)}
					on:focus={() => handle_mouseover(category)}
					on:mouseout={() => handle_mouseout()}
					on:blur={() => handle_mouseout()}
					class="category-label px-2 rounded-sm font-semibold cursor-pointer"
					style={"background-color:" + color.secondary}
				>
					{category}
				</div>
			{/each}
		</div>
	{/if}
	<div
		class="textfield bg-white dark:bg-transparent rounded-sm text-sm box-border max-w-full break-word leading-7 mt-7"
	>
		{#each value as [text, category]}
			<span
				class="textspan rounded-sm px-1 transition-colors text-black  pb-[0.225rem] pt-[0.15rem]"
				style:background-color={category === null ||
				(active && active !== category)
					? ""
					: _color_map[category].secondary}
				class:dark:text-white={category === null ||
					(active && active !== category)}
				class:hl={category !== null}
			>
				<span class="text ">{text}</span>
				{#if !show_legend && category !== null}
					<span
						class="label mr-[-4px] font-bold uppercase text-xs inline-category  text-white rounded-sm  px-[0.325rem] mt-[0.05rem] py-[0.05rem] transition-colors"
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
		<div
			class="color_legend flex px-2 py-1 justify-between rounded mb-3 font-semibold mt-7"
			style="background: -webkit-linear-gradient(to right,#8d83d6,(255,255,255,0),#eb4d4b); background: linear-gradient(to right,#8d83d6,rgba(255,255,255,0),#eb4d4b);"
		>
			<span>-1</span>
			<span>0</span>
			<span>+1</span>
		</div>
	{/if}
	<div
		class="textfield p-2 bg-white dark:bg-gray-800 rounded box-border max-w-full break-word leading-7"
	>
		{#each value as [text, score]}
			<span
				class="textspan p-1 mr-0.5 bg-opacity-20 dark:bg-opacity-80 rounded-sm"
				style={"background-color: rgba(" +
					(score < 0 ? "141, 131, 214," + -score : "235, 77, 75," + score) +
					")"}
			>
				<span class="text dark:text-white">{text}</span>
			</span>
		{/each}
	</div>
{/if}

<style>
	.hl + .hl {
		@apply ml-1;
	}

	.textspan:last-child > .label {
		@apply mr-0;
	}
</style>
