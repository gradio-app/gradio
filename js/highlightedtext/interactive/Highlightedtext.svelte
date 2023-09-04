<script lang="ts">
	const browser = typeof document !== "undefined";
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher, tick } from "svelte";
	import { correct_color_map } from "../utils";

	export let value: [string, string | number | null, symbol?][] = [];
	export let show_legend = false;
	export let color_map: Record<string, string> = {};
	export let selectable = false;

	let labelToEdit: number | null = null;
	let selectedTextElementIndex: number;
	let ctx: CanvasRenderingContext2D;
	let _color_map: Record<string, { primary: string; secondary: string }> = {};
	let active = "";

	async function handleTextSelected(
		startIndex: number,
		endIndex: number
	): Promise<void> {
		if (selectedTextElementIndex !== -1) {
			const tempFlag = Symbol();

			const str = value[selectedTextElementIndex][0];
			const [before, selected, after] = [
				str.substring(0, startIndex),
				str.substring(startIndex, endIndex),
				str.substring(endIndex),
			];

			value = [
				...value.slice(0, selectedTextElementIndex),
				[before, null],
				[selected, "label", tempFlag],
				[after, null],
				...value.slice(selectedTextElementIndex + 1),
			];

			// remove elements with empty labels
			value = value.filter((item) => item[0].trim() !== "");

			labelToEdit = value.findIndex(([_, __, flag]) => flag === tempFlag);
			value[labelToEdit].pop();

			handleValueChange();

			await tick();

			document.getElementById(`label-input-${labelToEdit}`)?.focus();
		}
	}

	const dispatch = createEventDispatcher<{
		select: SelectData;
		change: typeof value;
		input: never;
	}>();

	function splitTextByNewline(text: string): string[] {
		return text.split("\n");
	}

	function removeHighlightedText(index: number): void {
		if (index < 0 || index >= value.length) return;
		value[index][1] = null;
		handleValueChange();
	}

	function handleValueChange(): void {
		dispatch("change", value);
		dispatch("input");
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

		correct_color_map(color_map, _color_map, browser, ctx);
	}

	function handle_mouseover(label: string): void {
		active = label;
	}
	function handle_mouseout(): void {
		active = "";
	}

	function handle_mousedown(i: number): void {
		selectedTextElementIndex = i;
		document.addEventListener("mouseup", handle_mouseup);
	}

	function handle_mouseup(): void {
		const selection = window.getSelection();

		if (selection && selection.toString().trim() !== "") {
			const textBeginningIndex = selection.getRangeAt(0).startOffset;
			const textEndIndex = selection.getRangeAt(0).endOffset;

			handleTextSelected(textBeginningIndex, textEndIndex);
		}

		document.removeEventListener("mouseup", handle_mouseup);
	}

	function clearPlaceHolderOnFocus(e: FocusEvent): void {
		let target = e.target as HTMLInputElement;
		if (target && target.placeholder) target.placeholder = "";
	}

	function updateLabelValue(
		e: Event,
		elementIndex: number,
		text: string
	): void {
		let target = e.target as HTMLInputElement;
		value = [
			...value.slice(0, elementIndex),
			[text, target.value === "" ? null : target.value],
			...value.slice(elementIndex + 1),
		];
	}

	function handleSelect(
		i: number,
		text: string,
		category: string | number | null
	): void {
		dispatch("select", {
			index: i,
			value: [text, category],
		});
	}
</script>

<div class="container">
	{#if mode === "categories"}
		{#if show_legend}
			<div
				class="category-legend"
				data-testid="highlighted-text:category-legend"
			>
				{#each Object.entries(_color_map) as [category, color], i}
					<div
						role="button"
						aria-roledescription="Categories of highlighted text. Hover to see text with this category highlighted."
						tabindex="0"
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
						<span class="text-category-container">
							<span
								role="button"
								tabindex="0"
								class="textspan"
								style:background-color={category === null ||
								(active && active !== category)
									? ""
									: _color_map[category].secondary}
								class:no-cat={category === null ||
									(active && active !== category)}
								class:hl={category !== null}
								class:selectable
								on:click={() => handleSelect(i, text, category)}
								on:keydown={() => handleSelect(i, text, category)}
							>
								<span
									on:mousedown={() => handle_mousedown(i)}
									class:no-label={category === null}
									class="text"
									role="button"
									tabindex="0">{line}</span
								>
								{#if !show_legend && category !== null}
									&nbsp;
									{#if labelToEdit === i}
										<!-- svelte-ignore a11y-autofocus -->
										<!-- autofocus should not be disorienting for a screen reader users
										as input is only rendered once a new label is created -->
										<input
											autofocus
											id={`label-input-${i}`}
											type="text"
											on:focus={clearPlaceHolderOnFocus}
											placeholder="label"
											value={category}
											style:background-color={category === null ||
											(active && active !== category)
												? ""
												: _color_map[category].primary}
											style:width={category.toString().length + 3 + "ch"}
											on:input={(e) => updateLabelValue(e, i, text)}
											on:blur={(e) => {
												if (category === "") {
													updateLabelValue(e, i, text);
												}
												labelToEdit = null;
											}}
											on:keydown={(e) => {
												if (e.key === "Enter") {
													labelToEdit = null;
												}
											}}
										/>
									{:else}
										<span
											id={`label-tag-${i}`}
											class="label"
											role="button"
											tabindex="0"
											style:background-color={category === null ||
											(active && active !== category)
												? ""
												: _color_map[category].primary}
											on:click={() => (labelToEdit = i)}
											on:keydown={() => (labelToEdit = i)}
										>
											{category}
										</span>
									{/if}
								{/if}
							</span>
							{#if category !== null}
								<span
									class="label-clear-button"
									role="button"
									on:click={() => removeHighlightedText(i)}
									on:keydown={() => removeHighlightedText(i)}
									aria-roledescription="Remove label from text"
									tabindex="0"
									on:mousedown={() => handle_mousedown(i)}
									>×
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
				<span
					role="button"
					tabindex="0"
					on:mousedown={() => handle_mousedown(i)}
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
	.label-clear-button {
		display: none;
	}

	.text-category-container:hover .label-clear-button {
		display: inline;
		border-radius: var(--radius-xs);
		padding-top: 2.5px;
		padding-right: var(--size-1);
		padding-bottom: 3.5px;
		padding-left: var(--size-1);
		color: black;
		background-color: var(--background-fill-secondary);
		user-select: none;
		position: relative;
		left: -3px;
		border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
		color: var(--block-label-text-color);
	}

	.text-category-container:hover .textspan.hl {
		border-radius: var(--radius-xs) 0 0 var(--radius-xs);
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--block-padding);
	}

	.hl {
		margin-left: var(--size-1);
		transition: background-color 0.3s;
		user-select: none;
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
		cursor: text;
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
		user-select: none;
	}

	.text {
		color: black;
		white-space: pre-wrap;
	}

	.textspan.hl {
		user-select: none;
	}

	input {
		transition: 150ms;
		margin-top: 1px;
		margin-right: calc(var(--size-1));
		border-radius: var(--radius-xs);
		padding: 1px 5px;
		color: black;
		font-weight: var(--weight-bold);
		font-size: var(--text-sm);
		text-transform: uppercase;
		line-height: 1;
		color: white;
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
		user-select: text;
	}
</style>
