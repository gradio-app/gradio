<script lang="ts">
	const browser = typeof document !== "undefined";
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher, onMount } from "svelte";
	import { correct_color_map, merge_elements } from "./utils";
	import LabelInput from "./LabelInput.svelte";

	export let value: {
		token: string;
		class_or_confidence: string | number | null;
	}[] = [];
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
			value[activeElementIndex].token.toString().includes(selection.toString())
		) {
			const tempFlag = Symbol();

			const str = value[activeElementIndex].token;
			const [before, selected, after] = [
				str.substring(0, startIndex),
				str.substring(startIndex, endIndex),
				str.substring(endIndex)
			];

			let tempValue: {
				token: string;
				class_or_confidence: string | number | null;
				flag?: symbol;
			}[] = [
				...value.slice(0, activeElementIndex),
				{ token: before, class_or_confidence: null },
				{
					token: selected,
					class_or_confidence: mode === "scores" ? 1 : "label",
					flag: tempFlag
				}, // add a temp flag to the new highlighted text element
				{ token: after, class_or_confidence: null },
				...value.slice(activeElementIndex + 1)
			];

			// store the index of the new highlighted text element and remove the flag
			labelToEdit = tempValue.findIndex(({ flag }) => flag === tempFlag);
			// tempValue[labelToEdit].pop();

			// remove elements with empty labels
			tempValue = tempValue.filter((item) => item.token.trim() !== "");
			value = tempValue.map(({ flag, ...rest }) => rest);

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
		if (!value || index < 0 || index >= value.length) return;
		value[index].class_or_confidence = null;
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
			for (let entry of value) {
				if (entry.class_or_confidence !== null) {
					if (typeof entry.class_or_confidence === "string") {
						mode = "categories";
						if (!(entry.class_or_confidence in color_map)) {
							let color = get_next_color(Object.keys(color_map).length);
							color_map[entry.class_or_confidence] = color;
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
		class_or_confidence: string | number | null
	): void {
		dispatch("select", {
			index: i,
			value: [text, class_or_confidence]
		});
	}
</script>

<div class="container">
	{#if mode === "categories"}
		{#if show_legend}
			<div
				class="class_or_confidence-legend"
				data-testid="highlighted-text:class_or_confidence-legend"
			>
				{#if _color_map}
					{#each Object.entries(_color_map) as [class_or_confidence, color], i}
						<div
							role="button"
							aria-roledescription="Categories of highlighted text. Hover to see text with this class_or_confidence highlighted."
							tabindex="0"
							on:mouseover={() => handle_mouseover(class_or_confidence)}
							on:focus={() => handle_mouseover(class_or_confidence)}
							on:mouseout={() => handle_mouseout()}
							on:blur={() => handle_mouseout()}
							class="class_or_confidence-label"
							style={"background-color:" + color.secondary}
						>
							{class_or_confidence}
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		<div class="textfield">
			{#each value as { token, class_or_confidence }, i}
				{#each splitTextByNewline(token) as line, j}
					{#if line.trim() !== ""}
						<span class="text-class_or_confidence-container">
							<span
								role="button"
								tabindex="0"
								class="textspan"
								style:background-color={class_or_confidence === null ||
								(active && active !== class_or_confidence)
									? ""
									: class_or_confidence && _color_map[class_or_confidence]
										? _color_map[class_or_confidence].secondary
										: ""}
								class:no-cat={class_or_confidence === null ||
									(active && active !== class_or_confidence)}
								class:hl={class_or_confidence !== null}
								class:selectable
								on:click={() => {
									if (class_or_confidence !== null) {
										handleSelect(i, token, class_or_confidence);
									}
								}}
								on:keydown={(e) => {
									if (class_or_confidence !== null) {
										labelToEdit = i;
										handleSelect(i, token, class_or_confidence);
									} else {
										handleKeydownSelection(e);
									}
								}}
								on:focus={() => (activeElementIndex = i)}
								on:mouseover={() => (activeElementIndex = i)}
							>
								<span
									class:no-label={class_or_confidence === null}
									class="text"
									role="button"
									on:keydown={(e) => handleKeydownSelection(e)}
									on:focus={() => (activeElementIndex = i)}
									on:mouseover={() => (activeElementIndex = i)}
									on:click={() => (labelToEdit = i)}
									tabindex="0">{line}</span
								>
								{#if !show_legend && class_or_confidence !== null && labelToEdit !== i}
									<span
										id={`label-tag-${i}`}
										class="label"
										role="button"
										tabindex="0"
										style:background-color={class_or_confidence === null ||
										(active && active !== class_or_confidence)
											? ""
											: _color_map[class_or_confidence].primary}
										on:click={() => (labelToEdit = i)}
										on:keydown={() => (labelToEdit = i)}
									>
										{class_or_confidence}
									</span>
								{/if}
								{#if labelToEdit === i && class_or_confidence !== null}
									&nbsp;
									<LabelInput
										bind:value
										{labelToEdit}
										category={class_or_confidence}
										{active}
										{_color_map}
										indexOfLabel={i}
										text={token}
										{handleValueChange}
									/>
								{/if}
							</span>
							{#if class_or_confidence !== null}
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
					{#if j < splitTextByNewline(token).length - 1}
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
			{#each value as { token, class_or_confidence }, i}
				{@const score =
					typeof class_or_confidence === "string"
						? parseInt(class_or_confidence)
						: class_or_confidence}
				<span class="score-text-container">
					<span
						class="textspan score-text"
						role="button"
						tabindex="0"
						class:no-cat={class_or_confidence === null ||
							(active && active !== class_or_confidence)}
						class:hl={class_or_confidence !== null}
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
						<span class="text">{token}</span>
						{#if class_or_confidence && labelToEdit === i}
							<LabelInput
								bind:value
								{labelToEdit}
								{_color_map}
								category={class_or_confidence}
								{active}
								indexOfLabel={i}
								text={token}
								{handleValueChange}
								isScoresMode
							/>
						{/if}
					</span>
					{#if class_or_confidence && activeElementIndex === i}
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

	.text-class_or_confidence-container:hover .label-clear-button,
	.text-class_or_confidence-container:focus-within .label-clear-button,
	.score-text-container:hover .label-clear-button,
	.score-text-container:focus-within .label-clear-button {
		display: inline;
	}

	.text-class_or_confidence-container:hover .textspan.hl,
	.text-class_or_confidence-container:focus-within .textspan.hl,
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

	.class_or_confidence-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		color: black;
	}

	.class_or_confidence-label {
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
