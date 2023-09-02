<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import {handle_filter, handle_change, dispatch_blur, dispatch_select, handle_key_down, handle_focus} from "./utils"
	import { afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	import { _ } from "svelte-i18n";

	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | undefined;
	let old_value = Array.isArray(value) ? value.slice() : value;
	export let value_is_output = false;
	export let choices: [string, string][];
	export let disabled = false;
	export let show_label: boolean;
	export let container = true;
	export let allow_custom_value = false;

	let filter_input: HTMLElement;
	let input_text = "";
	let show_options = false;
	let filtered_indices: number[] = [];
	let choices_names: string[];
	let choices_values: string[];
	let active_index: number | null = null;
	let blurring = false;

	/* Setup including setting the default value as the first choice */

	if (choices.length > 0 && !value) {
		input_text = choices[0][0];
		value = choices[0][1];
	}

	$: {
		choices_names = choices.map((c) => c[0]);
		choices_values = choices.map((c) => c[1]);
	}

	$: filtered_indices = handle_filter(choices, input_text);

	$: {
		if (JSON.stringify(value) != JSON.stringify(old_value)) {
			old_value = Array.isArray(value) ? value.slice() : value;
			handle_change(value, value_is_output);
		}
	}

	function handle_option_selected(e: any, choices: [string, string][]): void {
		const option_index = e.detail.target.dataset.index;
		const [option_name, option_value] = choices[option_index];

		input_text = option_name;
		value = option_value;
		show_options = false;
		
		dispatch_select(option_index, option_value);
		filter_input.blur();
	}

	function handle_blur(): void {
		if (blurring) return;
		blurring = true;
		if (!allow_custom_value) {
			input_text = choices_names[choices_values.indexOf(value as string)];
		}
		show_options = false;
		dispatch_blur();
	}

	afterUpdate(() => {
		value_is_output = false;
	});
</script>

<label class:container>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			<div class="secondary-wrap">
				<input
					class="border-none"
					class:subdued={!choices_names.includes(input_text) && !allow_custom_value}
					{disabled}
					autocomplete="off"
					bind:value={input_text}
					bind:this={filter_input}
					on:keydown={handle_key_down}
					on:keyup={() => {
						if (allow_custom_value) {
							value = input_text;
						}
					}}
					on:blur={handle_blur}
					on:focus={handle_focus}
				/>
				<DropdownArrow />
			</div>
		</div>
		<DropdownOptions
			bind:value
			{show_options}
			{choices}
			{filtered_indices}
			{disabled}
			{active_index}
			on:change={handle_option_selected}
		/>
	</div>
</label>

<style>
	label:not(.container),
	label:not(.container) .wrap,
	label:not(.container) .wrap-inner,
	label:not(.container) .secondary-wrap,
	label:not(.container) input {
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
	}

	.wrap-inner {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--checkbox-label-gap);
		padding: var(--checkbox-label-padding);
	}
	.secondary-wrap {
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		border: none;
		min-width: min-content;
	}

	input {
		margin: var(--spacing-sm);
		outline: none;
		border: none;
		background: inherit;
		width: var(--size-full);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
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
</style>
