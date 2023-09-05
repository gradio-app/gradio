<script lang="ts">
	type HighlightedTextType = [string, string | number | null, symbol?];

	export let value: HighlightedTextType[];
	export let category: string | number;
	export let active: string;
	export let _color_map: Record<string, { primary: string; secondary: string }>;
	export let label: number | null;
	export let i: number;
	export let text: string;
	export let handleValueChange: () => void;

	let _input_value = category;

	function handleInput(e: Event): void {
		let target = e.target as HTMLInputElement;
		if (target) {
			_input_value = target.value;
		}
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

		handleValueChange();
	}

	function clearPlaceHolderOnFocus(e: FocusEvent): void {
		let target = e.target as HTMLInputElement;
		if (target && target.placeholder) target.placeholder = "";
	}
</script>

<!-- svelte-ignore a11y-autofocus -->
<!-- autofocus should not be disorienting for a screen reader users
as input is only rendered once a new label is created -->
<input
	class="label-input"
	autofocus
	id={`label-input-${i}`}
	type="text"
	placeholder="label"
	value={category}
	style:background-color={category === null || (active && active !== category)
		? ""
		: _color_map[category].primary}
	style:width={_input_value.toString().length + 3 + "ch"}
	on:input={handleInput}
	on:blur={(e) => {
		updateLabelValue(e, i, text);
		label = null;
	}}
	on:keydown={(e) => {
		if (e.key === "Enter") {
			label = null;
		}
	}}
	on:focus={clearPlaceHolderOnFocus}
/>

<style>
	.label-input {
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

	.label-input::placeholder {
		color: rgba(1, 1, 1, 0.5);
	}
</style>
