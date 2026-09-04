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
		show_whitespaces = false,
		interactive = false,
		selectable = false,
		onselect,
		onchange
	}: {
		value?: HighlightedToken[];

		show_legend?: boolean;
		show_inline_category?: boolean;
		color_map?: Record<string, string>;
		show_whitespaces?: boolean;
		interactive?: boolean;
		selectable?: boolean;
		onselect?: (data: SelectData) => void;
		onchange?: (data: HighlightedToken[]) => void;
	} = $props();

	let active_element_index = $state(-1);
	let active_legend = $state("");
	let label_to_edit = $state(-1);
	let selection: Selection | null = $state(null);

	let mode: "categories" | "scores" = $state("categories");
	let resolved_color_map: Record<string, ColorPair> = $state({});
	let roving_token_key = $state("");

	let category_selectable_token_keys = $derived.by(() =>
		value.flatMap(({ token, class_or_confidence }, i) => {
			if (!is_token_selectable(class_or_confidence)) return [];
			return token
				.split("\n")
				.flatMap((line, j) =>
					is_visible_line(line) ? [category_token_key(i, j)] : []
				);
		})
	);
	let score_selectable_token_keys = $derived(
		value.flatMap(({ class_or_confidence }, i) =>
			is_token_selectable(class_or_confidence) ? [score_token_key(i)] : []
		)
	);

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
		if (!selection) return;
		const text = selection.toString();
		if (!text) return;
		if (!show_whitespaces && !text.trim()) return;

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
		].filter((e) =>
			show_whitespaces ? e.token !== "" : e.token.trim() !== ""
		);

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

	function handle_token_select(
		index: number,
		token: string,
		class_or_confidence: string | number | null
	): void {
		onselect?.({
			index,
			value: [token, class_or_confidence]
		});

		if (interactive && class_or_confidence !== null) {
			label_to_edit = index;
		}
	}

	function handle_score_token_select(
		index: number,
		token: string,
		class_or_confidence: string | number | null
	): void {
		if (interactive && class_or_confidence !== null) {
			label_to_edit = index;
		} else {
			onselect?.({
				index,
				value: [token, class_or_confidence]
			});
		}
	}

	function is_token_selectable(
		class_or_confidence: string | number | null
	): boolean {
		return selectable || (interactive && class_or_confidence !== null);
	}

	function is_visible_line(line: string): boolean {
		return show_whitespaces ? line !== "" : Boolean(line.trim());
	}

	function category_token_key(index: number, line_index: number): string {
		return `category-${index}-${line_index}`;
	}

	function score_token_key(index: number): string {
		return `score-${index}`;
	}

	function get_roving_tabindex(key: string, selectable_keys: string[]): 0 | -1 {
		const current_key = selectable_keys.includes(roving_token_key)
			? roving_token_key
			: selectable_keys[0];
		return key === current_key ? 0 : -1;
	}

	function handle_token_keydown(e: KeyboardEvent, activate: () => void): void {
		if (e.target !== e.currentTarget || e.repeat) return;

		if (
			e.key === "ArrowRight" ||
			e.key === "ArrowDown" ||
			e.key === "ArrowLeft" ||
			e.key === "ArrowUp" ||
			e.key === "Home" ||
			e.key === "End"
		) {
			e.preventDefault();
			const current_token = e.currentTarget as HTMLElement;
			const tokens = Array.from(
				current_token
					.closest(".textfield")
					?.querySelectorAll<HTMLElement>('.token[role="button"]') ?? []
			);
			const current_index = tokens.indexOf(current_token);
			let next_index: number;

			if (e.key === "Home") {
				next_index = 0;
			} else if (e.key === "End") {
				next_index = tokens.length - 1;
			} else {
				const direction =
					e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
				next_index =
					(current_index + direction + tokens.length) % tokens.length;
			}

			tokens[next_index]?.focus();
			return;
		}

		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			activate();
		}
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
				{@const token_is_selectable = is_token_selectable(class_or_confidence)}
				{#each lines as line, j}
					{#if show_whitespaces ? line !== "" : line.trim()}
						{@const bg_color = get_background_color(class_or_confidence)}
						{@const token_key = category_token_key(i, j)}
						<span class="token-container">
							<span
								class="token"
								class:selectable={selectable && class_or_confidence === null}
								class:highlighted={class_or_confidence !== null}
								class:transparent={class_or_confidence !== null &&
									is_transparent(bg_color)}
								class:dimmed={active_legend &&
									active_legend !== class_or_confidence}
								style:background-color={bg_color}
								style:color={get_text_color(class_or_confidence)}
								role={token_is_selectable ? "button" : undefined}
								tabindex={token_is_selectable
									? get_roving_tabindex(
											token_key,
											category_selectable_token_keys
										)
									: undefined}
								onclick={() => {
									if (!token_is_selectable) return;
									handle_token_select(i, line, class_or_confidence);
								}}
								onkeydown={(e) =>
									handle_token_keydown(e, () =>
										handle_token_select(i, line, class_or_confidence)
									)}
								onfocus={() => {
									active_element_index = i;
									roving_token_key = token_key;
								}}
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
						<span class="line-break"></span>
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
				{@const token_is_selectable = is_token_selectable(class_or_confidence)}
				{@const token_key = score_token_key(i)}
				<span class="token-container">
					<span
						class="token score-token"
						class:selectable={selectable && score === null}
						class:highlighted={score !== null}
						style:background-color={get_score_color(score)}
						role={token_is_selectable ? "button" : undefined}
						tabindex={token_is_selectable
							? get_roving_tabindex(token_key, score_selectable_token_keys)
							: undefined}
						onmouseenter={() => (active_element_index = i)}
						onfocus={() => {
							active_element_index = i;
							roving_token_key = token_key;
						}}
						onclick={() => {
							if (!token_is_selectable) return;
							handle_score_token_select(i, token, class_or_confidence);
						}}
						onkeydown={(e) =>
							handle_token_keydown(e, () =>
								handle_score_token_select(i, token, class_or_confidence)
							)}
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
		display: flex;
		flex-wrap: wrap;
		line-height: var(--scale-4);
		word-break: break-all;
	}

	.line-break {
		flex-basis: 100%;
		height: 0;
	}

	.token-container {
		position: relative;
	}

	.token {
		transition: 150ms;
		border-radius: var(--radius-xs);
	}

	.token.selectable {
		cursor: pointer;
	}

	.token.highlighted {
		cursor: pointer;
		padding: var(--size-0-5) var(--size-1);
		margin-left: var(--size-1);
		margin-right: var(--size-2);
	}

	.token.highlighted.transparent {
		padding: var(--size-0-5) var(--size-0-5);
		margin: 0;
		outline: 1px solid transparent;
	}

	.token.highlighted.transparent:hover {
		outline-color: var(--neutral-400);
	}

	:global(.dark) .token.highlighted.transparent:hover {
		outline-color: var(--neutral-500);
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
		top: 0;
		right: 0;
		width: var(--size-3);
		height: var(--size-3);
		border: none;
		border-radius: 50%;
		background: var(--neutral-400);
		color: white;
		font-size: 10px;
		cursor: pointer;
		justify-content: center;
		align-items: center;
	}

	:global(.dark) .remove-btn {
		background: var(--neutral-500);
		color: var(--neutral-950);
	}

	.remove-btn :global(svg) {
		width: var(--size-1-5);
		height: var(--size-1-5);
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
