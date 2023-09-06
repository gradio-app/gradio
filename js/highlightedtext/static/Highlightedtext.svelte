<script lang="ts">
	const browser = typeof document !== "undefined";
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import { correct_color_map } from "../utils";

	export let value: [string, string | number | null][] = [];
	export let show_legend = false;
	export let color_map: Record<string, string> = {};
	export let selectable = false;

	let ctx: CanvasRenderingContext2D;
	let _color_map: Record<string, { primary: string; secondary: string }> = {};
	let active = "";

	function splitTextByNewline(text: string): string[] {
		return text.split("\n");
	}

	const dispatch = createEventDispatcher<{
		select: SelectData;
	}>();

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

		correct_color_map(color_map, _color_map, browser, ctx);
	}

	function handle_mouseover(label: string): void {
		active = label;
	}
	function handle_mouseout(): void {
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

<div class="container">
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
						>
							<span
								class:no-label={category && !_color_map[category]}
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
			{#each value as [text, _score]}
				{@const score = typeof _score === "string" ? parseInt(_score) : _score}
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
		cursor: pointer;
	}
</style>
