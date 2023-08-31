<script lang="ts">
	const browser = typeof document !== "undefined";
	import { colors } from "@gradio/theme";
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let value: [string, string | number | null][] = [];
	export let show_legend = false;
	export let color_map: Record<string, string> = {};
	export let selectable = false;

	let currentSelectedArrayIndex: number;

	function handle_text_selected(
		currentSelectedArrayIndex: number,
		startIndex: number,
		endIndex: number
	): void {
		if (currentSelectedArrayIndex !== -1) {
			const before = value[currentSelectedArrayIndex][0].substring(
				0,
				startIndex
			);
			const selected = value[currentSelectedArrayIndex][0].substring(
				startIndex,
				endIndex
			);
			const after = value[currentSelectedArrayIndex][0].substring(endIndex);

			value = [
				...value.slice(0, currentSelectedArrayIndex),
				[before, null],
				[selected, "hello"],
				[after, null],
				...value.slice(currentSelectedArrayIndex + 1),
			];

			value = value.filter((item) => item[0].trim() !== "");

			dispatch("change", value);
		}
	}

	let ctx: CanvasRenderingContext2D;

	let _color_map: Record<string, { primary: string; secondary: string }> = {};
	let active = "";

	const dispatch = createEventDispatcher<{
		select: SelectData;
		change: typeof value;
	}>();

	function splitTextByNewline(text: string): string[] {
		return text.split("\n");
	}

	function correct_color_map(): void {
		for (const col in color_map) {
			const _c = color_map[col].trim();

			if (_c in colors) {
				_color_map[col] = colors[_c as keyof typeof colors];
			} else {
				_color_map[col] = {
					primary: browser ? name_to_rgba(color_map[col], 1) : color_map[col],
					secondary: browser
						? name_to_rgba(color_map[col], 0.5)
						: color_map[col],
				};
			}
		}
	}

	function name_to_rgba(name: string, a: number): string {
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

		correct_color_map();
	}

	function handle_mouseover(label: string): void {
		active = label;
	}
	function handle_mouseout(): void {
		active = "";
	}

	function house_mouse_down(): void {
		document.addEventListener("mouseup", handle_mouse_up);
	}

	function handle_mouse_up(): void {
		const selection = window.getSelection();
		console.log(selection);
		console.log(value);

		if (selection && selection.toString().trim() !== "") {
			const textBeginningIndex = selection.getRangeAt(0).startOffset;
			const textEndIndex = selection.getRangeAt(0).endOffset;

			handle_text_selected(
				currentSelectedArrayIndex,
				textBeginningIndex,
				textEndIndex
			);

			document.removeEventListener("mouseup", handle_mouse_up);
		}
	}

	function handle_mouse_over(
		category: string | number | null,
		i: number
	): void {
		if (category === null) {
			currentSelectedArrayIndex = i;
		} else {
			currentSelectedArrayIndex = -1;
		}
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container" on:mousedown={house_mouse_down}>
	{#if mode === "categories"}
		{#if show_legend}
			<div
				class="category-legend"
				data-testid="highlighted-text:category-legend"
			>
				{#each Object.entries(_color_map) as [category, color], i}
					<!-- TODO: fix -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
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
			{#each value as [text, category], i}
				{#each splitTextByNewline(text) as line, j}
					{#if line.trim() !== ""}
						<!-- TODO: fix -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events-->
						<span
							class="textspan"
							style:background-color={category === null ||
							(active && active !== category)
								? ""
								: _color_map[category].secondary}
							class:no-cat={category === null ||
								(active && active !== category)}
							class:hl={category !== null}
							class:selectable
							on:click={() => {
								dispatch("select", {
									index: i,
									value: [text, category],
								});
							}}
							on:mouseenter={() => handle_mouse_over(category, i)}
						>
							<span
								class:no-label={!category || !_color_map[category]}
								class="text">{line}</span
							>
							{#if !show_legend && category !== null}
								&nbsp;
								<span
									class="label"
									style:background-color={category === null ||
									(active && active !== category)
										? ""
										: _color_map[category].primary}
									on:mouseenter={() => handle_mouse_over(category, i)}
								>
									{category}
								</span>
							{/if}
						</span>
					{/if}
					{#if j < splitTextByNewline(text).length - 1}
						<br />
					{/if}
				{/each}
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
			{#each value as [text, _score], i}
				{@const score = typeof _score === "string" ? parseInt(_score) : _score}
				<span on:mouseenter={() => handle_mouse_over(_score, i)}>
					<span
						class="textspan score-text"
						style={"background-color: rgba(" +
							(score && score < 0
								? "128, 90, 213," + -score
								: "239, 68, 60," + score) +
							")"}
					>
						<span class="text">{text}</span>
					</span>
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--block-padding);
	}
	.hl + .hl {
		margin-left: var(--size-1);
	}

	.textspan:last-child > .label {
		margin-right: 0;
	}

	.category-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		color: black;
	}

	.category-label {
		cursor: pointer;
		border-radius: var(--radius-xs);
		padding-right: var(--size-2);
		padding-left: var(--size-2);
		font-weight: var(--weight-semibold);
	}

	.color-legend {
		display: flex;
		justify-content: space-between;
		border-radius: var(--radius-xs);
		background: linear-gradient(
			to right,
			var(--color-purple),
			rgba(255, 255, 255, 0),
			var(--color-red)
		);
		padding: var(--size-1) var(--size-2);
		font-weight: var(--weight-semibold);
	}

	.textfield {
		box-sizing: border-box;
		border-radius: var(--radius-xs);
		background: var(--background-fill-primary);
		background-color: transparent;
		max-width: var(--size-full);
		line-height: var(--scale-4);
		word-break: break-all;
	}

	.textspan {
		transition: 150ms;
		border-radius: var(--radius-xs);
		padding-top: 2.5px;
		padding-right: var(--size-1);
		padding-bottom: 3.5px;
		padding-left: var(--size-1);
		color: black;
	}

	.label {
		transition: 150ms;
		margin-top: 1px;
		margin-right: calc(var(--size-1) * -1);
		border-radius: var(--radius-xs);
		padding: 1px 5px;
		color: var(--body-text-color);
		color: white;
		font-weight: var(--weight-bold);
		font-size: var(--text-sm);
		text-transform: uppercase;
	}

	.text {
		color: black;
		white-space: pre-wrap;
	}

	.score-text .text {
		color: var(--body-text-color);
	}

	.score-text {
		margin-right: var(--size-1);
		padding: var(--size-1);
	}

	.no-cat {
		color: var(--body-text-color);
	}

	.no-label {
		color: var(--body-text-color);
	}

	.selectable {
		cursor: text;
	}
</style>
