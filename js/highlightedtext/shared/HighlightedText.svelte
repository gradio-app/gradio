<script lang="ts">
	import { get_next_color } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";
	import { onMount } from "svelte";
	import {
		generate_color_map,
		merge_elements,
		get_score_color,
		is_transparent,
		type HighlightedToken,
		type ColorPair
	} from "./utils";
	import LabelInput from "./LabelInput.svelte";
	import { Clear } from "@gradio/icons";

	const is_browser = typeof window !== "undefined";

	let {
		value = $bindable([]),
		show_legend = false,
		show_inline_category = true,
		color_map = {},
		interactive = false,
		onselect,
		onchange
	}: {
		value?: HighlightedToken[];
		show_legend?: boolean;
		show_inline_category?: boolean;
		color_map?: Record<string, string>;
		interactive?: boolean;
		onselect?: (data: SelectData) => void;
		onchange?: (data: HighlightedToken[]) => void;
	} = $props();

	let active_element_index = $state(-1);
	let active_legend = $state("");
	let label_to_edit = $state(-1);
	let selection: Selection | null = $state(null);

	let mode: "categories" | "scores" = $state("categories");
	let resolved_color_map: Record<string, ColorPair> = $state({});

	$effect(() => {
		let local_colors = { ...color_map };

		for (const entry of value) {
			if (entry.class_or_confidence === null) continue;

			if (typeof entry.class_or_confidence === "string") {
				mode = "categories";
				if (!(entry.class_or_confidence in local_colors)) {
					local_colors[entry.class_or_confidence] = get_next_color(
						Object.keys(local_colors).length
					);
				}
			} else {
				mode = "scores";
			}
		}

		resolved_color_map = generate_color_map(local_colors, is_browser);
	});

	onMount(() => {
		if (!interactive) return;

		const on_mouse_up = (): void => {
			selection = window.getSelection();
			handle_selection_complete();
			window.removeEventListener("mouseup", on_mouse_up);
		};

		window.addEventListener("mousedown", () => {
			window.addEventListener("mouseup", on_mouse_up);
		});
	});

	function handle_selection_complete(): void {
		if (!selection || !selection.toString().trim()) return;

		const start = selection.getRangeAt(0).startOffset;
		const end = selection.getRangeAt(0).endOffset;
		handle_text_selected(start, end);
	}

	function handle_text_selected(start: number, end: number): void {
		if (
			!selection?.toString() ||
			active_element_index === -1 ||
			!value[active_element_index].token.includes(selection.toString())
		) {
			return;
		}

		const str = value[active_element_index].token;
		const new_entries: HighlightedToken[] = [
			{ token: str.substring(0, start), class_or_confidence: null },
			{
				token: str.substring(start, end),
				class_or_confidence: mode === "scores" ? 1 : "label"
			},
			{ token: str.substring(end), class_or_confidence: null }
		].filter((e) => e.token.trim() !== "");

		value = [
			...value.slice(0, active_element_index),
			...new_entries,
			...value.slice(active_element_index + 1)
		];

		label_to_edit = value.findIndex(
			(v, i) =>
				i >= active_element_index &&
				v.token === str.substring(start, end) &&
				v.class_or_confidence !== null
		);

		handle_value_change();
		document.getElementById(`label-input-${label_to_edit}`)?.focus();
	}

	function remove_highlight(index: number): void {
		if (index < 0 || index >= value.length) return;
		value[index].class_or_confidence = null;
		value = merge_elements(value, "equal");
		handle_value_change();
		window.getSelection()?.empty();
	}

	function handle_value_change(): void {
		onchange?.(value);
		label_to_edit = -1;
	}

	function get_background_color(
		class_or_confidence: string | number | null
	): string {
		if (class_or_confidence === null) return "";
		if (active_legend && active_legend !== class_or_confidence) return "";
		return resolved_color_map[class_or_confidence]?.secondary ?? "";
	}

	function get_label_color(
		class_or_confidence: string | number | null
	): string {
		if (class_or_confidence === null) return "";
		if (active_legend && active_legend !== class_or_confidence) return "";
		return resolved_color_map[class_or_confidence]?.primary ?? "";
	}

	function get_text_color(class_or_confidence: string | number | null): string {
		const bg = get_background_color(class_or_confidence);
		return is_transparent(bg) ? "" : "black";
	}
</script>

<div class="container">
	{#if mode === "categories"}
		{#if show_legend}
			<div class="legend" data-testid="highlighted-text:category-legend">
				{#each Object.entries(resolved_color_map) as [category, colors]}
					<button
						class="legend-item"
						style:background-color={colors.secondary}
						onmouseenter={() => (active_legend = category)}
						onmouseleave={() => (active_legend = "")}
						onfocus={() => (active_legend = category)}
						onblur={() => (active_legend = "")}
					>
						{category}
					</button>
				{/each}
			</div>
		{/if}

		<div class="textfield">
			{#each value as { token, class_or_confidence }, i}
				{@const lines = token.split("\n")}
				{#each lines as line, j}
					{#if line.trim()}
						<span class="token-container">
							<span
								class="token"
								class:highlighted={class_or_confidence !== null}
								class:dimmed={active_legend &&
									active_legend !== class_or_confidence}
								style:background-color={get_background_color(
									class_or_confidence
								)}
								style:color={get_text_color(class_or_confidence)}
								role="button"
								tabindex={0}
								onclick={() => {
									if (interactive) {
										if (class_or_confidence !== null) {
											onselect?.({
												index: i,
												value: [token, class_or_confidence]
											});
										}
										label_to_edit = i;
									} else {
										onselect?.({
											index: i,
											value: [token, class_or_confidence]
										});
									}
								}}
								onkeydown={(e) => {
									if (!interactive) return;
									if (e.key === "Enter" && class_or_confidence !== null) {
										label_to_edit = i;
									}
								}}
								onfocus={() => (active_element_index = i)}
								onmouseenter={() => (active_element_index = i)}
							>
								<span
									class="text"
									class:unlabeled={class_or_confidence === null}>{line}</span
								>

								{#if !show_legend && show_inline_category && class_or_confidence !== null && label_to_edit !== i}
									<span
										class="label"
										style:background-color={get_label_color(
											class_or_confidence
										)}
									>
										{class_or_confidence}
									</span>
								{/if}

								{#if interactive && label_to_edit === i && class_or_confidence !== null}
									<LabelInput
										bind:value
										bind:label_to_edit
										category={class_or_confidence}
										{active_legend}
										color_map={resolved_color_map}
										label_index={i}
										{token}
										onchange={handle_value_change}
									/>
								{/if}
							</span>

							{#if interactive && class_or_confidence !== null}
								<button
									class="remove-btn"
									aria-label="Remove label"
									onclick={() => remove_highlight(i)}
								>
									<Clear />
								</button>
							{/if}
						</span>
					{/if}
					{#if j < lines.length - 1}
						<br />
					{/if}
				{/each}
			{/each}
		</div>
	{:else}
		{#if show_legend}
			<div class="score-legend" data-testid="highlighted-text:color-legend">
				<span>-1</span>
				<span>0</span>
				<span>+1</span>
			</div>
		{/if}

		<div class="textfield" data-testid="highlighted-text:textfield">
			{#each value as { token, class_or_confidence }, i}
				{@const score =
					typeof class_or_confidence === "string"
						? parseFloat(class_or_confidence)
						: class_or_confidence}
				<span class="token-container">
					<span
						class="token score-token"
						class:highlighted={score !== null}
						style:background-color={get_score_color(score)}
						role="button"
						tabindex={0}
						onmouseenter={() => (active_element_index = i)}
						onfocus={() => (active_element_index = i)}
						onclick={() => {
							if (interactive) {
								label_to_edit = i;
							} else {
								onselect?.({
									index: i,
									value: [token, class_or_confidence]
								});
							}
						}}
						onkeydown={(e) => {
							if (e.key === "Enter") {
								if (interactive) {
									label_to_edit = i;
								} else {
									onselect?.({
										index: i,
										value: [token, class_or_confidence]
									});
								}
							}
						}}
					>
						<span class="text">{token}</span>

						{#if interactive && class_or_confidence !== null && label_to_edit === i}
							<LabelInput
								bind:value
								bind:label_to_edit
								category={class_or_confidence}
								{active_legend}
								color_map={resolved_color_map}
								label_index={i}
								{token}
								onchange={handle_value_change}
								is_scores_mode
							/>
						{/if}
					</span>

					{#if interactive && class_or_confidence !== null && active_element_index === i}
						<button
							class="remove-btn"
							aria-label="Remove label"
							onclick={() => remove_highlight(i)}
						>
							<Clear />
						</button>
					{/if}
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

	.legend,
	.score-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.legend-item {
		cursor: pointer;
		border: none;
		border-radius: var(--radius-xs);
		padding: 0 var(--size-2);
		font-weight: var(--weight-semibold);
		color: black;
	}

	.score-legend {
		justify-content: space-between;
		border-radius: var(--radius-xs);
		background: linear-gradient(
			to right,
			var(--color-purple),
			transparent,
			var(--color-red)
		);
		padding: var(--size-1) var(--size-2);
		font-weight: var(--weight-semibold);
	}

	.textfield {
		line-height: var(--scale-4);
		word-break: break-all;
	}

	.token-container {
		position: relative;
	}

	.token {
		transition: 150ms;
		border-radius: var(--radius-xs);
		cursor: pointer;
	}

	.token.highlighted {
		padding: var(--size-0-5) var(--size-1);
		margin-left: var(--size-1);
		margin-right: var(--size-2);
	}

	.token.dimmed {
		color: var(--body-text-color);
	}

	.text {
		white-space: pre-wrap;
	}

	.text.unlabeled {
		color: var(--body-text-color);
	}

	.score-token .text {
		color: var(--body-text-color);
	}

	.label {
		margin-left: 4px;
		border-radius: var(--radius-xs);
		padding: 1px 5px;
		color: var(--color-white);
		font-weight: var(--weight-bold);
		text-transform: uppercase;
		font-size: 70%;
		vertical-align: middle;
		bottom: 1px;
		position: relative;
	}

	.remove-btn {
		display: none;
		position: absolute;
		top: -8px;
		right: 0px;
		width: 14px;
		height: 14px;
		border: none;
		border-radius: 50%;
		background: var(--neutral-400);
		color: white;
		font-size: 10px;
		line-height: 1;
		cursor: pointer;
		justify-content: center;
		align-items: center;
	}

	:global(.dark) .remove-btn {
		background: var(--neutral-500);
		color: var(--neutral-950);
	}

	.remove-btn :global(svg) {
		width: var(--size-2);
		height: var(--size-2);
	}

	.remove-btn:hover {
		background: var(--neutral-500);
	}

	:global(.dark) .remove-btn:hover {
		background: var(--neutral-400);
	}

	.token-container:hover .remove-btn,
	.token-container:focus-within .remove-btn {
		display: flex;
	}
</style>
