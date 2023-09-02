<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import {handle_filter, handle_change} from "./utils"
	import { afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	import { _ } from "svelte-i18n";

	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | string[] | undefined;
	let old_value = Array.isArray(value) ? value.slice() : value;
	export let value_is_output = false;
	export let max_choices: number;
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

	/* Handlers for both single-select and multi-select dropdowns */

	function handle_blur(): void {
		if (blurring) return;
		blurring = true;
		if (multiselect) {
			input_text = "";
		} else if (!allow_custom_value) {
			input_text = choices_names[choices_values.indexOf(value as string)];
		}
		show_options = false;
		dispatch("blur");
		setTimeout(() => {
			blurring = false;
		}, 100);
	}


	/* Handlers specifically for multi-select dropdown */

	function add(option_index: number): void {
		value = value as string[];
		if (!max_choices || value.length < max_choices) {
			value.push(choices_values[option_index]);
			dispatch("select", {
				index: option_index,
				value: choices_values[option_index],
				selected: true
			});
		}
		value = value;
	}

	function remove(option_index: number): void {
		const option_value = choices_values[option_index];
		if (!disabled) {
			value = value as string[];
			value = value.filter((v: string) => v !== option_value);
		}
		dispatch("select", {
			index: option_index,
			value: choices[option][1],
			selected: false
		});
	}

	function remove_all(e: any): void {
		value = [];
		input_text = "";
		e.preventDefault();
	}

	function handle_focus(e: FocusEvent): void {
		if (blurring) {
			// Remove focus triggered by blurring to the label.
			let target = e.target as HTMLInputElement;
			return target.blur();
		}
		dispatch("focus");
		filtered_indices = choices.map((_, i) => i);
		show_options = true;
	}

	// eslint-disable-next-line complexity
	function handle_key_down(e: any): void {
		if (e.key === "Enter") {
			if (!multiselect) {
				if (value !== activeOption) {
					value = activeOption;
					dispatch("select", {
						index: choices.indexOf(value),
						value: value,
						selected: true
					});
				}
				input_text = activeOption;
				show_options = false;
				filter_input.blur();
			} else if (multiselect && Array.isArray(value)) {
				value.includes(activeOption) ? remove(activeOption) : add(activeOption);
				input_text = "";
			}
		} else {
			show_options = true;
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				if (activeOption === null) {
					activeOption = filtered[0];
				}
				const increment = e.key === "ArrowUp" ? -1 : 1;
				const calcIndex = filtered.indexOf(activeOption) + increment;
				activeOption =
					calcIndex < 0
						? filtered[filtered.length - 1]
						: calcIndex === filtered.length
						? filtered[0]
						: filtered[calcIndex];
				e.preventDefault();
			} else if (e.key === "Escape") {
				show_options = false;
			} else if (e.key === "Backspace") {
				if (
					multiselect &&
					(!input_text || input_text === "") &&
					Array.isArray(value) &&
					value.length > 0
				) {
					remove(value[value.length - 1]);
					input_text = "";
				}
			} else {
				show_options = true;
			}
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});
</script>

<label class:container>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			{#if multiselect && Array.isArray(value)}
				{#each value as s}
					<!-- TODO: fix -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions-->
					<div on:click|preventDefault={() => remove(s)} class="token">
						<span>{s}</span>
						{#if !disabled}
							<div
								class:hidden={disabled}
								class="token-remove"
								title={$_("common.remove") + " " + s}
							>
								<Remove />
							</div>
						{/if}
					</div>
				{/each}
			{/if}
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
				<!-- TODO: fix -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions-->
				<div
					class:hide={!multiselect || !value?.length || disabled}
					class="token-remove remove-all"
					title={$_("common.clear")}
					on:click={remove_all}
				>
					<Remove />
				</div>
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
	label:not(.container) .token,
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

	.token {
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		box-shadow: var(--checkbox-label-shadow);
		border: var(--checkbox-label-border-width) solid
			var(--checkbox-label-border-color);
		border-radius: var(--button-small-radius);
		background: var(--checkbox-label-background-fill);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-label-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	.token > * + * {
		margin-left: var(--size-2);
	}

	.token-remove {
		fill: var(--body-text-color);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: var(--checkbox-border-width) solid var(--border-color-primary);
		border-radius: var(--radius-full);
		background: var(--background-fill-primary);
		padding: var(--size-0-5);
		width: 18px;
		height: 18px;
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

	.remove-all {
		margin-left: var(--size-1);
		width: 20px;
		height: 20px;
	}

	.hide {
		display: none;
	}

	.subdued {
		color: var(--body-text-color-subdued);
	}
</style>
