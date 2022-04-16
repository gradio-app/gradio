<script lang="ts">
	import { getNextColor } from "./utils";

	export let value: Array<[string, string | number]> = [];
	export let theme: string = "default";
	export let show_legend: boolean = false;
	export let color_map: Record<string, string> = {};
	export let style: string = "";

	let ctx: CanvasRenderingContext2D;

	function name_to_rgba(name: string) {
		if (!ctx) {
			var canvas = document.createElement("canvas");
			ctx = canvas.getContext("2d")!;
		}
		ctx.fillStyle = name;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		ctx.clearRect(0, 0, 1, 1);
		return `rgba(${r}, ${g}, ${b}, ${255 / a})`;
	}

	let mode: "categories" | "scores";

	if (color_map === null) {
		color_map = {};
	}
	if (value.length > 0) {
		for (let [_, label] of value) {
			if (label !== null) {
				if (typeof label === "string") {
					mode = "categories";
					if (!(label in color_map)) {
						let color = getNextColor(Object.keys(color_map).length);
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
			if (_c.startsWith("rgba")) {
				color_map[col] = color_map[col];
			} else {
				color_map[col] = name_to_rgba(color_map[col]);
			}
		}
	}

	correct_color_map();
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

<div class="border rounded-lg p-2" {theme}>
	{#if mode === "categories"}
		{#if show_legend}
			<div class="category-legend flex flex-wrap gap-1 mb-2">
				{#each Object.entries(color_map) as [category, color], i}
					<div
						class="category-label px-2 rounded text-white font-semibold"
						style={"background-color:" + color}
					>
						{category}
					</div>
				{/each}
			</div>
		{/if}
		<div
			class="textfield bg-white dark:bg-gray-800 rounded box-border max-w-full break-word inline-flex flex-wrap gap-1"
		>
			{#each value as [text, category], i}
				<span
					class="textspan bg-opacity-10 rounded inline-flex items-center px-1.5 space-x-1.5"
					style={category === null
						? ""
						: `color: ${color_map[category]}; background-color: ${color_map[
								category
						  ].replace("1)", "var(--tw-bg-opacity))")}`}
				>
					<span class="text dark:text-white">{text}</span>
					{#if !show_legend && category !== null}
						<span
							class="inline-category text-xs text-white rounded-sm px-1"
							style={category === null
								? ""
								: `background-color: ${color_map[category]}`}
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
				class="color_legend flex px-2 py-1 justify-between rounded mb-3 font-semibold"
				style="background: -webkit-linear-gradient(to right,#8d83d6,(255,255,255,0),#eb4d4b); background: linear-gradient(to right,#8d83d6,rgba(255,255,255,0),#eb4d4b);"
			>
				<span>-1</span>
				<span>0</span>
				<span>+1</span>
			</div>
		{/if}
		<div
			class="textfield p-2 bg-white dark:bg-gray-800 rounded box-border max-w-full break-word"
		>
			{#each value as [text, score], i}
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
</div>
