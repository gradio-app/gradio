<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { DropdownArrow } from "@gradio/icons";
	import type { SelectData, KeyUpData } from "@gradio/utils";
	import { handle_filter, handle_change, handle_shared_keys } from "./utils";

	type Item = string | number;

	export let label: string;
	export let info: string | undefined = undefined;
	export let value: Item | Item[] | undefined = undefined;
	let old_value: typeof value = undefined;
	export let value_is_output = false;
	export let choices: [string, Item][];
	let old_choices: typeof choices;
	export let disabled = false;
	export let show_label: boolean;
	export let container = true;
	export let allow_custom_value = false;
	export let filterable = true;
	export let root: string;

	let filter_input: HTMLElement;

	let show_options = false;
	let choices_names: string[];
	let choices_values: (string | number)[];
	let input_text = "";
	let old_input_text = "";
	let initialized = false;

	// All of these are indices with respect to the choices array
	let filtered_indices: number[] = [];
	let active_index: number | null = null;
	// selected_index is null if allow_custom_value is true and the input_text is not in choices_names
	let selected_index: number | null = null;
	let old_selected_index: number | null;

	const dispatch = createEventDispatcher<{
		change: string | undefined;
		input: undefined;
		select: SelectData;
		blur: undefined;
		focus: undefined;
		key_up: KeyUpData;
	}>();

	// Setting the initial value of the dropdown
	if (value) {
		old_selected_index = choices.map((c) => c[1]).indexOf(value as string);
		selected_index = old_selected_index;
		if (selected_index === -1) {
			old_value = value;
			selected_index = null;
		} else {
			[input_text, old_value] = choices[selected_index];
			old_input_text = input_text;
		}
		set_input_text();
	}

	$: {
		if (
			selected_index !== old_selected_index &&
			selected_index !== null &&
			initialized
		) {
			[input_text, value] = choices[selected_index];
			old_selected_index = selected_index;
			dispatch("select", {
				index: selected_index,
				value: choices_values[selected_index],
				selected: true
			});
		}
	}

	$: if (JSON.stringify(old_value) !== JSON.stringify(value)) {
		set_input_text();
		handle_change(dispatch, value, value_is_output);
		old_value = value;
	}

	function set_choice_names_values(): void {
		choices_names = choices.map((c) => c[0]);
		choices_values = choices.map((c) => c[1]);
	}

	$: choices, set_choice_names_values();

	const is_browser = typeof window !== "undefined";

	$: {
		if (choices !== old_choices) {
			if (!allow_custom_value) {
				set_input_text();
			}
			old_choices = choices;
			filtered_indices = handle_filter(choices, input_text);
			if (!allow_custom_value && filtered_indices.length > 0) {
				active_index = filtered_indices[0];
			}
			if (is_browser && filter_input === document.activeElement) {
				show_options = true;
			}
		}
	}

	$: {
		if (input_text !== old_input_text) {
			filtered_indices = handle_filter(choices, input_text);
			old_input_text = input_text;
			if (!allow_custom_value && filtered_indices.length > 0) {
				active_index = filtered_indices[0];
			}
		}
	}

	function set_input_text(): void {
		set_choice_names_values();
		if (value === undefined || (Array.isArray(value) && value.length === 0)) {
			input_text = "";
			selected_index = null;
		} else if (choices_values.includes(value as string)) {
			input_text = choices_names[choices_values.indexOf(value as string)];
			selected_index = choices_values.indexOf(value as string);
		} else if (allow_custom_value) {
			input_text = value as string;
			selected_index = null;
		} else {
			input_text = "";
			selected_index = null;
		}
		old_selected_index = selected_index;
	}

	function handle_option_selected(e: any): void {
		selected_index = parseInt(e.detail.target.dataset.index);
		if (isNaN(selected_index)) {
			// This is the case when the user clicks on the scrollbar
			selected_index = null;
			return;
		}
		show_options = false;
		active_index = null;
		filter_input.blur();
	}

	function handle_focus(e: FocusEvent): void {
		filtered_indices = choices.map((_, i) => i);
		show_options = true;
		dispatch("focus");
	}

	function handle_blur(): void {
		if (!allow_custom_value) {
			input_text = choices_names[choices_values.indexOf(value as string)];
		} else {
			value = input_text;
		}
		show_options = false;
		active_index = null;
		dispatch("blur");
	}

	function handle_key_down(e: KeyboardEvent): void {
		[show_options, active_index] = handle_shared_keys(
			e,
			active_index,
			filtered_indices
		);
		if (e.key === "Enter") {
			if (active_index !== null) {
				selected_index = active_index;
				show_options = false;
				filter_input.blur();
				active_index = null;
			} else if (choices_names.includes(input_text)) {
				selected_index = choices_names.indexOf(input_text);
				show_options = false;
				active_index = null;
				filter_input.blur();
			} else if (allow_custom_value) {
				value = input_text;
				selected_index = null;
				show_options = false;
				active_index = null;
				filter_input.blur();
			}
		}
	}

	afterUpdate(() => {
		value_is_output = false;
		initialized = true;
	});
</script>

<div class:container>
	<BlockTitle {root} {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			<div class="secondary-wrap">
				<input
					role="listbox"
					aria-controls="dropdown-options"
					aria-expanded={show_options}
					aria-label={label}
					class="border-none"
					class:subdued={!choices_names.includes(input_text) &&
						!allow_custom_value}
					{disabled}
					autocomplete="off"
					bind:value={input_text}
					bind:this={filter_input}
					on:keydown={handle_key_down}
					on:keyup={(e) =>
						dispatch("key_up", {
							key: e.key,
							input_value: input_text
						})}
					on:blur={handle_blur}
					on:focus={handle_focus}
					readonly={!filterable}
				/>
				{#if !disabled}
					<div class="icon-wrap">
						<DropdownArrow />
					</div>
				{/if}
			</div>
		</div>
		<DropdownOptions
			{show_options}
			{choices}
			{filtered_indices}
			{disabled}
			selected_indices={selected_index === null ? [] : [selected_index]}
			{active_index}
			on:change={handle_option_selected}
		/>
	</div>
</div>

<style>
	.icon-wrap {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: var(--size-5);
		color: var(--body-text-color);
		width: var(--size-5);
		pointer-events: none;
	}
	.container {
		height: 100%;
	}
	.container .wrap {
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--border-color-primary);
	}

	.wrap {
		position: relative;
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
	}

	.wrap:focus-within {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
		background: var(--input-background-fill-focus);
	}

	.wrap-inner {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--checkbox-label-gap);
		padding: var(--checkbox-label-padding);
		height: 100%;
	}
	.secondary-wrap {
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		border: none;
		min-width: min-content;
		height: 100%;
	}

	input {
		margin: var(--spacing-sm);
		outline: none;
		border: none;
		background: inherit;
		width: var(--size-full);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		height: 100%;
	}

	input:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
		cursor: not-allowed;
	}

	.subdued {
		color: var(--body-text-color-subdued);
	}

	input[readonly] {
		cursor: pointer;
	}
</style>
