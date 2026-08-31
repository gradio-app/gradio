function positive_mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

export function handle_filter(
	choices: [string, string | number][],
	input_text: string,
	max_values_shown: number | null = null
): number[] {
	const filtered_indices: number[] = [];
	const normalized_input = input_text.toLowerCase();

	for (let index = 0; index < choices.length; index++) {
		if (
			!normalized_input ||
			choices[index][0].toLowerCase().includes(normalized_input)
		) {
			filtered_indices.push(index);
			if (
				max_values_shown !== null &&
				filtered_indices.length >= max_values_shown
			) {
				break;
			}
		}
	}

	return filtered_indices;
}

export function handle_change(
	dispatch: any,
	value: string | number | (string | number)[] | undefined,
	value_is_output: boolean
): void {
	dispatch("change", value);
	if (!value_is_output) {
		dispatch("input");
	}
}

export function handle_shared_keys(
	e: KeyboardEvent,
	active_index: number | null,
	filtered_indices: number[]
): [boolean, number | null] {
	if (e.key === "Escape") {
		return [false, active_index];
	}
	if (e.key === "ArrowDown" || e.key === "ArrowUp") {
		if (filtered_indices.length > 0) {
			if (active_index === null) {
				active_index =
					e.key === "ArrowDown"
						? filtered_indices[0]
						: filtered_indices[filtered_indices.length - 1];
			} else {
				const index_in_filtered = filtered_indices.indexOf(active_index);
				const increment = e.key === "ArrowUp" ? -1 : 1;
				active_index =
					filtered_indices[
						positive_mod(index_in_filtered + increment, filtered_indices.length)
					];
			}
		}
	}
	return [true, active_index];
}
