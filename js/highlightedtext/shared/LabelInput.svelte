<script lang="ts">
	import type { HighlightedToken, ColorPair } from "./utils";
	import { get_score_color } from "./utils";

	let {
		value = $bindable([]),
		label_to_edit = $bindable(-1),
		category,
		active_legend,
		color_map,
		label_index,
		token,
		onchange,
		is_scores_mode = false
	}: {
		value: HighlightedToken[];
		label_to_edit: number;
		category: string | number | null;
		active_legend: string;
		color_map: Record<string, ColorPair>;
		label_index: number;
		token: string;
		onchange: () => void;
		is_scores_mode?: boolean;
	} = $props();

	let input_value = $state(category?.toString() ?? "");

	function get_background_color(): string {
		if (is_scores_mode) {
			const score =
				typeof category === "number" ? category : parseFloat(category ?? "0");
			return get_score_color(score);
		}
		if (category === null || (active_legend && active_legend !== category)) {
			return "";
		}
		return color_map[category]?.primary ?? "";
	}

	function update_value(e: Event): void {
		const target = e.target as HTMLInputElement;
		const new_value = target.value.trim();

		value = [
			...value.slice(0, label_index),
			{
				token,
				class_or_confidence:
					new_value === ""
						? null
						: is_scores_mode
							? Number(new_value)
							: new_value
			},
			...value.slice(label_index + 1)
		];

		onchange();
	}

	function handle_keydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			update_value(e);
			label_to_edit = -1;
		}
	}
</script>

<input
	class="label-input"
	autofocus
	type={is_scores_mode ? "number" : "text"}
	step={is_scores_mode ? "0.1" : undefined}
	placeholder={is_scores_mode ? undefined : "label"}
	value={category}
	style:background-color={get_background_color()}
	style:width={is_scores_mode ? "7ch" : `${(input_value?.length || 4) + 4}ch`}
	oninput={(e) => {
		input_value = (e.target as HTMLInputElement).value;
	}}
	onblur={update_value}
	onkeydown={handle_keydown}
/>

<style>
	.label-input {
		margin-top: 1px;
		margin-left: 4px;
		border: none;
		border-radius: var(--radius-xs);
		padding: 1px 5px;
		color: var(--color-white);
		font-weight: var(--weight-bold);
		font-size: var(--text-sm);
		text-transform: uppercase;
		line-height: 1;
	}

	.label-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}
</style>
