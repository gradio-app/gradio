<script lang="ts">
	const browser = typeof document !== "undefined";
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher, onMount } from "svelte";
	import { correct_color_map, merge_elements } from "../utils";
	import LabelInput from "./LabelInput.svelte";

	export let value: [string, string | number | null][] = [];
	export let show_legend = false;
	export let color_map: Record<string, string> = {};
	export let selectable = false;

	let activeElementIndex = -1;
	let ctx: CanvasRenderingContext2D;
	let _color_map: Record<string, { primary: string; secondary: string }> = {};
	let active = "";
	let selection: Selection | null;
	let labelToEdit = -1;

	onMount(() => {
		const mouseUpHandler = (): void => {
			selection = window.getSelection();
			handleSelectionComplete();
			window.removeEventListener("mouseup", mouseUpHandler);
		};

		window.addEventListener("mousedown", () => {
			window.addEventListener("mouseup", mouseUpHandler);
		});
	});

	async function handleTextSelected(
		startIndex: number,
		endIndex: number
	): Promise<void> {
		if (
			selection?.toString() &&
			activeElementIndex !== -1 &&
			value[activeElementIndex][0].toString().includes(selection.toString())
		) {
			const tempFlag = Symbol();

			const str = value[activeElementIndex][0];
			const [before, selected, after] = [
				str.substring(0, startIndex),
				str.substring(startIndex, endIndex),
				str.substring(endIndex),
			];

			let tempValue: [string, string | number | null, symbol?][] = [
				...value.slice(0, activeElementIndex),
				[before, null],
				[selected, mode === "scores" ? 1 : "label", tempFlag], // add a temp flag to the new highlighted text element
				[after, null],
				...value.slice(activeElementIndex + 1),
			];

			// store the index of the new highlighted text element and remove the flag
			labelToEdit = tempValue.findIndex(([_, __, flag]) => flag === tempFlag);
			tempValue[labelToEdit].pop();

			// remove elements with empty labels
			tempValue = tempValue.filter((item) => item[0].trim() !== "");
			value = tempValue as [string, string | number | null][];

			handleValueChange();
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
		value = merge_elements(value, "equal");
		handleValueChange();
		window.getSelection()?.empty();
	}

	function handleValueChange(): void {
		dispatch("change", value);
		labelToEdit = -1;

		// reset legend color maps
		if (show_legend) {
			color_map = {};
			_color_map = {};
		}
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

	async function handleKeydownSelection(event: KeyboardEvent): Promise<void> {
		selection = window.getSelection();

		if (event.key === "Enter") {
			handleSelectionComplete();
		}
	}

	function handleSelectionComplete(): void {
		if (selection && selection?.toString().trim() !== "") {
			const textBeginningIndex = selection.getRangeAt(0).startOffset;
			const textEndIndex = selection.getRangeAt(0).endOffset;
			handleTextSelected(textBeginningIndex, textEndIndex);
		}
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
				{#if _color_map}
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
				{/if}
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
									: category && _color_map[category]
									? _color_map[category].secondary
									: ""}
								class:no-cat={category === null ||
									(active && active !== category)}
								class:hl={category !== null}
								class:selectable
								on:click={() => {
									if (category !== null) {
										handleSelect(i, text, category);
									}
								}}
								on:keydown={(e) => {
									if (category !== null) {
										labelToEdit = i;
										handleSelect(i, text, category);
									} else {
										handleKeydownSelection(e);
									}
								}}
								on:focus={() => (activeElementIndex = i)}
								on:mouseover={() => (activeElementIndex = i)}
							>
								<span
									class:no-label={category === null}
									class="text"
									role="button"
									on:keydown={(e) => handleKeydownSelection(e)}
									on:focus={() => (activeElementIndex = i)}
									on:mouseover={() => (activeElementIndex = i)}
									on:click={() => (labelToEdit = i)}
									tabindex="0">{line}</span
								>
								{#if !show_legend && category !== null && labelToEdit !== i}
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
								{#if labelToEdit === i && category !== null}
									&nbsp;
									<LabelInput
										bind:value
										{labelToEdit}
										{category}
										{active}
										{_color_map}
										indexOfLabel={i}
										{text}
										{handleValueChange}
									/>
								{/if}
							</span>
							{#if category !== null}
								<span
									class="label-clear-button"
									role="button"
									aria-roledescription="Remove label from text"
									tabindex="0"
									on:click={() => removeHighlightedText(i)}
									on:keydown={(event) => {
										if (event.key === "Enter") {
											removeHighlightedText(i);
										}
									}}
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
				<span class="score-text-container">
					<span
						class="textspan score-text"
						role="button"
						tabindex="0"
						class:no-cat={_score === null || (active && active !== _score)}
						class:hl={_score !== null}
						on:mouseover={() => (activeElementIndex = i)}
						on:focus={() => (activeElementIndex = i)}
						on:click={() => (labelToEdit = i)}
						on:keydown={(e) => {
							if (e.key === "Enter") {
								labelToEdit = i;
							}
						}}
						style={"background-color: rgba(" +
							(score && score < 0
								? "128, 90, 213," + -score
								: "239, 68, 60," + score) +
							")"}
					>
						<span class="text">{text}</span>
						{#if _score && labelToEdit === i}
							<LabelInput
								bind:value
								{labelToEdit}
								{_color_map}
								category={_score}
								{active}
								indexOfLabel={i}
								{text}
								{handleValueChange}
								isScoresMode
							/>
						{/if}
					</span>
					{#if _score && activeElementIndex === i}
						<span
							class="label-clear-button"
							role="button"
							aria-roledescription="Remove label from text"
							tabindex="0"
							on:click={() => removeHighlightedText(i)}
							on:keydown={(event) => {
								if (event.key === "Enter") {
									removeHighlightedText(i);
								}
							}}
							>×
						</span>
					{/if}
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.label-clear-button {
		display: none;
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

	.text-category-container:hover .label-clear-button,
	.text-category-container:focus-within .label-clear-button,
	.score-text-container:hover .label-clear-button,
	.score-text-container:focus-within .label-clear-button {
		display: inline;
	}

	.text-category-container:hover .textspan.hl,
	.text-category-container:focus-within .textspan.hl,
	.score-text:hover {
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

	.score-text-container {
		margin-right: var(--size-1);
	}

	.score-text .text {
		color: var(--body-text-color);
	}

	.no-cat {
		color: var(--body-text-color);
	}

	.no-label {
		color: var(--body-text-color);
		user-select: text;
	}

	.selectable {
		cursor: text;
		user-select: text;
	}
</style>
