<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { BlockTitle, IconButtonWrapper } from "@gradio/atoms";
	import { DropdownArrow } from "@gradio/icons";
	import { handle_filter, handle_shared_keys } from "./utils";
	import {
		type SelectData,
		type KeyUpData,
		type CustomButton as CustomButtonType
	} from "@gradio/utils";
	import { tick } from "svelte";

	const is_browser = typeof window !== "undefined";

	let {
		label = "Dropdown",
		info = undefined,
		value = $bindable<string | number | null>(),
		choices = [],
		interactive = true,
		show_label = true,
		container = true,
		allow_custom_value = false,
		filterable = true,
		buttons = null,
		oncustom_button_click = null,
		on_change,
		on_input,
		on_select,
		on_focus,
		on_blur,
		on_key_up
	}: {
		label: string;
		info?: string;
		value: string | number | null;
		choices: [string, string | number][];
		interactive: boolean;
		show_label: boolean;
		container: boolean;
		allow_custom_value: boolean;
		filterable: boolean;
		buttons: (string | CustomButtonType)[] | null;
		oncustom_button_click?: ((id: number) => void) | null;
		on_change?: (value: string | number | null) => void;
		on_input?: () => void;
		on_select?: (data: SelectData) => void;
		on_focus?: () => void;
		on_blur?: () => void;
		on_key_up?: (data: KeyUpData) => void;
	} = $props();

	let filter_input: HTMLElement;

	const uid = $props.id();
	const listbox_id = `${uid}-options`;

	let show_options = $derived.by(() => {
		return is_browser && filter_input === document.activeElement;
	});
	let choices_names = $derived(choices.map((c) => c[0]));
	let choices_values = $derived(choices.map((c) => c[1]));
	let input_text = $state("");
	let selected_index: number | null = $state(null);

	function is_focused(): boolean {
		return is_browser && filter_input === document.activeElement;
	}

	$effect(() => {
		// Reference reactive deps explicitly so this effect re-runs when the
		// value or available choices change.
		const current_value = value;
		const values = choices_values;
		const names = choices_names;
		// While the user is typing in the input, don't overwrite what they have
		// entered just because `choices` were updated from the backend (e.g.
		// dynamic filtering via `key_up`). Doing so wipes the in-progress text.
		if (is_focused()) {
			return;
		}
		if (
			current_value === undefined ||
			current_value === null ||
			(Array.isArray(current_value) && current_value.length === 0)
		) {
			input_text = "";
			selected_index = null;
		} else if (values.includes(current_value as string | number)) {
			input_text = names[values.indexOf(current_value as string | number)];
			selected_index = values.indexOf(current_value as string | number);
		} else if (allow_custom_value) {
			input_text = current_value as string;
			selected_index = null;
		} else {
			input_text = "";
			selected_index = null;
		}
	});
	// Use last_typed_value to track when the user has typed
	// on_blur we only want to update value if the user has typed
	let last_typed_value = input_text;
	let initialized = $state(false);
	let disabled = $derived(!interactive);

	// All of these are indices with respect to the choices array
	let filtered_indices = $state(choices.map((_, i) => i));
	let active_index: number | null = $state(null);
	let selected_indices = $derived(
		selected_index === null ? [] : [selected_index]
	);

	// When the choices change (e.g. the backend returns new options in response
	// to a `key_up` event for search-as-you-type), surface all of the newly
	// provided choices instead of leaving a stale filtered list behind.
	$effect(() => {
		choices;
		filtered_indices = choices.map((_, i) => i);
	});

	function handle_option_selected(index: any): void {
		selected_index = parseInt(index);
		if (isNaN(selected_index)) {
			// This is the case when the user clicks on the scrollbar
			selected_index = null;
			return;
		}

		let [_input_text, _value] = choices[selected_index];
		input_text = _input_text;
		last_typed_value = input_text;
		value = _value;
		on_select?.({
			index: selected_index,
			value: choices_values[selected_index],
			selected: true
		});
		show_options = false;
		active_index = null;
		on_input?.();
		filter_input.blur();
	}

	function handle_focus(e: FocusEvent): void {
		filtered_indices = choices.map((_, i) => i);
		show_options = true;
		on_focus?.();
	}

	function handle_blur(): void {
		if (!allow_custom_value) {
			input_text =
				choices_names[choices_values.indexOf(value as string | number)];
		} else {
			if (choices_names.includes(input_text)) {
				selected_index = choices_names.indexOf(input_text);
				value = choices_values[selected_index];
			} else if (input_text !== last_typed_value) {
				value = input_text;
				selected_index = null;
			}
		}
		show_options = false;
		active_index = null;
		filtered_indices = choices.map((_, i) => i);
		on_blur?.();
		on_input?.();
	}

	async function handle_key_down(e: KeyboardEvent): Promise<void> {
		await tick();
		filtered_indices = handle_filter(choices, input_text);
		active_index = filtered_indices.length > 0 ? filtered_indices[0] : null;
		[show_options, active_index] = handle_shared_keys(
			e,
			active_index,
			filtered_indices
		);
		if (e.key === "Enter") {
			last_typed_value = input_text;
			if (active_index !== null) {
				selected_index = active_index;
				value = choices_values[active_index];
				show_options = false;
				filter_input.blur();
				active_index = null;
			} else if (choices_names.includes(input_text)) {
				selected_index = choices_names.indexOf(input_text);
				value = choices_values[selected_index];
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

	let old_value = $state(value);
	$effect(() => {
		if (old_value !== value) {
			old_value = value;
			on_change?.(value);
		}
	});
</script>

<div class:container>
	{#if show_label && buttons && buttons.length > 0}
		<IconButtonWrapper
			{buttons}
			on_custom_button_click={oncustom_button_click}
		/>
	{/if}
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			<div class="secondary-wrap">
				<input
					role="combobox"
					aria-controls={listbox_id}
					aria-expanded={show_options}
					aria-haspopup="listbox"
					aria-autocomplete={filterable ? "list" : "none"}
					aria-activedescendant={show_options && active_index !== null
						? `${listbox_id}-option-${active_index}`
						: undefined}
					aria-label={label}
					class="border-none"
					class:subdued={!choices_names.includes(input_text) &&
						!allow_custom_value}
					autocomplete="off"
					{disabled}
					bind:value={input_text}
					bind:this={filter_input}
					onkeydown={handle_key_down}
					onkeyup={(e) => {
						on_key_up?.({
							key: e.key,
							input_value: input_text
						});
					}}
					onblur={handle_blur}
					onfocus={handle_focus}
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
			{selected_indices}
			{active_index}
			{listbox_id}
			onchange={handle_option_selected}
			onload={() => (initialized = true)}
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
