<script lang="ts">
	import { _ } from "svelte-i18n";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	import type { Gradio } from "@gradio/utils";
	import DropdownOptions from "./DropdownOptions.svelte";
	import { handle_filter, handle_change, handle_shared_keys } from "./utils";
	import type { DropdownEvents, DropdownProps, Item } from "../types.ts";

	const props = $props();

	const gradio: Gradio<DropdownEvents, DropdownProps> = props.gradio;

	let filter_input: HTMLElement;
	let input_text = $state("");

	let choices_names: string[] = $derived.by(() => {
		return gradio.props.choices.map((c) => c[0]);
	});
	let choices_values: (string | number)[] = $derived.by(() => {
		return gradio.props.choices.map((c) => c[1]);
	});

	let disabled = $derived(!gradio.shared.interactive);

	let show_options = $state(false);

	// All of these are indices with respect to the choices array
	let [filtered_indices, active_index] = $derived.by(() => {
		const filtered = handle_filter(gradio.props.choices, input_text);
		return [
			filtered,
			filtered.length > 0 && !gradio.props.allow_custom_value
				? filtered[0]
				: null
		];
	});

	function set_selected_indices(): Item[] {
		if (gradio.props.value === undefined) {
			return [];
		} else if (Array.isArray(gradio.props.value)) {
			return gradio.props.value
				.map((v) => {
					const index = choices_values.indexOf(v);
					if (index !== -1) {
						return index;
					}
					if (gradio.props.allow_custom_value) {
						return v;
					}
					// Instead of returning null, skip this iteration
					return undefined;
				})
				.filter((val): val is string | number => val !== undefined);
		}
		return [];
	}

	let selected_indices: (number | string)[] = $derived.by(set_selected_indices);

	function handle_blur(): void {
		if (!gradio.props.allow_custom_value) {
			input_text = "";
		}

		if (gradio.props.allow_custom_value && input_text !== "") {
			add_selected_choice(input_text);
			input_text = "";
		}

		show_options = false;
		active_index = null;
		gradio.dispatch("blur");
	}

	function remove_selected_choice(option_index: number | string) {
		selected_indices = selected_indices.filter((v) => v !== option_index);
		gradio.props.value = selected_indices.map((index) =>
			typeof index === "number" ? choices_values[index] : index
		);
		gradio.dispatch("change");
		gradio.dispatch("input");
		gradio.dispatch("select", {
			index: typeof option_index === "number" ? option_index : -1,
			value:
				typeof option_index === "number"
					? choices_values[option_index]
					: option_index,
			selected: false
		});
	}

	function add_selected_choice(option_index: number | string) {
		if (
			gradio.props.max_choices == null ||
			selected_indices.length < gradio.props.max_choices
		) {
			selected_indices.push(option_index);
			gradio.dispatch("select", {
				index: typeof option_index === "number" ? option_index : -1,
				value:
					typeof option_index === "number"
						? choices_values[option_index]
						: option_index,
				selected: true
			});
		}
		if (selected_indices.length === gradio.props.max_choices) {
			show_options = false;
			active_index = null;
			filter_input.blur();
		}
		gradio.props.value = selected_indices.map((index) =>
			typeof index === "number" ? choices_values[index] : index
		);
	}

	function handle_option_selected(e: any): void {
		const option_index = parseInt(e.detail.target.dataset.index);
		add_or_remove_index(option_index);
	}

	function add_or_remove_index(option_index: number): void {
		if (selected_indices.includes(option_index)) {
			remove_selected_choice(option_index);
		} else {
			add_selected_choice(option_index);
		}
		input_text = "";
		active_index = null;
		gradio.dispatch("change");
		gradio.dispatch("input");
	}

	function remove_all(e: any): void {
		selected_indices = [];
		input_text = "";
		gradio.props.value = [];
		e.preventDefault();
	}

	function handle_focus(e: FocusEvent): void {
		filtered_indices = gradio.props.choices.map((_, i) => i);
		if (
			gradio.props.max_choices === null ||
			selected_indices.length < gradio.props.max_choices
		) {
			show_options = true;
		}
		gradio.dispatch("focus");
		show_options = true;
	}

	function handle_key_down(e: KeyboardEvent): void {
		[show_options, active_index] = handle_shared_keys(
			e,
			active_index,
			filtered_indices
		);
		if (e.key === "Enter") {
			if (active_index !== null) {
				add_or_remove_index(active_index);
			} else {
				if (gradio.props.allow_custom_value) {
					add_selected_choice(input_text);
					input_text = "";
				}
			}
		}
		if (e.key === "Backspace" && input_text === "") {
			selected_indices = [...selected_indices.slice(0, -1)];
		}
		if (selected_indices.length === gradio.props.max_choices) {
			show_options = false;
			active_index = null;
		}
	}

	$effect(() => {
		const access_state = [
			$state.snapshot(gradio.props.choices),
			$state.snapshot(gradio.props.value)
		];
		gradio.dispatch("change");
	});
</script>

<label class:container={gradio.shared.container}>
	<BlockTitle show_label={gradio.shared.show_label} info={gradio.props.info}
		>{gradio.shared.label}</BlockTitle
	>

	<div class="wrap">
		<div class="wrap-inner" class:show_options>
			{#each selected_indices as s}
				<div class="token">
					<span>
						{#if typeof s === "number"}
							{choices_names[s]}
						{:else}
							{s}
						{/if}
					</span>
					{#if !disabled}
						<div
							class="token-remove"
							on:click|preventDefault={() => remove_selected_choice(s)}
							on:keydown|preventDefault={(event) => {
								if (event.key === "Enter") {
									remove_selected_choice(s);
								}
							}}
							role="button"
							tabindex="0"
							title={gradio.i18n("common.remove") + " " + s}
						>
							<Remove />
						</div>
					{/if}
				</div>
			{/each}
			<div class="secondary-wrap">
				<input
					class="border-none"
					class:subdued={(!choices_names.includes(input_text) &&
						!gradio.props.allow_custom_value) ||
						selected_indices.length === gradio.props.max_choices}
					{disabled}
					autocomplete="off"
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
					{#if selected_indices.length > 0}
						<div
							role="button"
							tabindex="0"
							class="token-remove remove-all"
							title={gradio.i18n("common.clear")}
							on:click={remove_all}
							on:keydown={(event) => {
								if (event.key === "Enter") {
									remove_all(event);
								}
							}}
						>
							<Remove />
						</div>
					{/if}
					<span class="icon-wrap"> <DropdownArrow /></span>
				{/if}
			</div>
		</div>
		<DropdownOptions
			{show_options}
			choices={gradio.props.choices}
			{filtered_indices}
			{disabled}
			{selected_indices}
			{active_index}
			remember_scroll={true}
			on:change={handle_option_selected}
		/>
	</div>
</label>

<style>
	.icon-wrap {
		color: var(--body-text-color);
		margin-right: var(--size-2);
		width: var(--size-5);
	}
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
		word-break: break-word;
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
		width: 16px;
		height: 16px;
		flex-shrink: 0;
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
	.subdued {
		color: var(--body-text-color-subdued);
	}
	input[readonly] {
		cursor: pointer;
	}
</style>
