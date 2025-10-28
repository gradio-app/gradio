<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { DropdownArrow } from "@gradio/icons";
	import { handle_filter, handle_shared_keys } from "./utils";
	import type { Gradio } from "@gradio/utils";
	import type { DropdownEvents, DropdownProps, Item } from "../types.ts";

	const is_browser = typeof window !== "undefined";

	let props = $props();

	const gradio: Gradio<DropdownEvents, DropdownProps> = props.gradio;

	let filter_input: HTMLElement;

	let show_options = $derived.by(() => {
		return is_browser && filter_input === document.activeElement;
	});
	let choices_names: string[] = $derived.by(() => {
		return gradio.props.choices.map((c) => c[0]);
	});
	let choices_values: (string | number)[] = $derived.by(() => {
		return gradio.props.choices.map((c) => c[1]);
	});
	let [input_text, selected_index] = $derived.by(() => {
		if (
			gradio.props.value === undefined ||
			(Array.isArray(gradio.props.value) && gradio.props.value.length === 0)
		) {
			return ["", null];
		} else if (choices_values.includes(gradio.props.value as string)) {
			return [
				choices_names[choices_values.indexOf(gradio.props.value as string)],
				choices_values.indexOf(gradio.props.value as string)
			];
		} else if (gradio.props.allow_custom_value) {
			return [gradio.props.value as string, null];
		} else {
			return ["", null];
		}
	});
	let initialized = $state(false);
	let disabled = $derived(!gradio.shared.interactive);

	// All of these are indices with respect to the choices array
	let [filtered_indices, active_index] = $derived.by(() => {
		const filtered = handle_filter(gradio.props.choices, input_text);
		return [filtered, filtered.length > 0 ? filtered[0] : null];
	});

	// Setting the initial value of the dropdown
	if (gradio.props.value) {
		selected_index = gradio.props.choices
			.map((c) => c[1])
			.indexOf(gradio.props.value as string);
		if (selected_index === -1) {
			selected_index = null;
		} else {
			input_text = gradio.props.choices[selected_index][0];
		}
	}

	function handle_option_selected(e: any): void {
		selected_index = parseInt(e.detail.target.dataset.index);
		if (isNaN(selected_index)) {
			// This is the case when the user clicks on the scrollbar
			selected_index = null;
			return;
		}

		let [_input_text, _value] = gradio.props.choices[selected_index];
		input_text = _input_text;
		gradio.props.value = _value;
		gradio.dispatch("select", {
			index: selected_index,
			value: choices_values[selected_index],
			selected: true
		});
		show_options = false;
		active_index = null;
		filter_input.blur();
	}

	function handle_focus(e: FocusEvent): void {
		filtered_indices = gradio.props.choices.map((_, i) => i);
		show_options = true;
		gradio.dispatch("focus");
	}

	function handle_blur(): void {
		if (!gradio.props.allow_custom_value) {
			input_text =
				choices_names[choices_values.indexOf(gradio.props.value as string)];
		} else {
			gradio.props.value = input_text;
		}
		show_options = false;
		active_index = null;
		gradio.dispatch("blur");
		gradio.dispatch("change");
		gradio.dispatch("input");
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
				gradio.props.value = choices_values[active_index];
				show_options = false;
				filter_input.blur();
				active_index = null;
			} else if (choices_names.includes(input_text)) {
				selected_index = choices_names.indexOf(input_text);
				gradio.props.value = choices_values[selected_index];
				show_options = false;
				active_index = null;
				filter_input.blur();
			} else if (gradio.props.allow_custom_value) {
				gradio.props.value = input_text;
				selected_index = null;
				show_options = false;
				active_index = null;
				filter_input.blur();
			}
		}
	}

	let old_value = $state(gradio.props.value);
	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change", $state.snapshot(gradio.props.value));
		}
	});
</script>

<div class:container={gradio.shared.container}>
	<BlockTitle show_label={gradio.shared.show_label} info={gradio.props.info}
		>{gradio.shared.label}</BlockTitle
	>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			<div class="secondary-wrap">
				<input
					role="listbox"
					aria-controls="dropdown-options"
					aria-expanded={show_options}
					aria-label={gradio.shared.label}
					class="border-none"
					class:subdued={!choices_names.includes(input_text) &&
						!gradio.props.allow_custom_value}
					autocomplete="off"
					{disabled}
					bind:value={input_text}
					bind:this={filter_input}
					on:keydown={handle_key_down}
					on:keyup={(e) =>
						gradio.dispatch("key_up", {
							key: e.key,
							input_value: input_text
						})}
					on:blur={handle_blur}
					on:focus={handle_focus}
					readonly={!gradio.props.filterable}
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
			choices={gradio.props.choices}
			{filtered_indices}
			{disabled}
			selected_indices={selected_index === null ? [] : [selected_index]}
			{active_index}
			on:change={handle_option_selected}
			on:load={() => (initialized = true)}
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
