<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles, SelectData } from "@gradio/utils";

	export let value: Array<string> = [];
	let old_value: Array<string> = value.slice();
	export let value_is_output: boolean = false;
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: Array<string>;
		input: undefined;
		select: SelectData;
	}>();

	const toggleChoice = (choice: string) => {
		if (value.includes(choice)) {
			value.splice(value.indexOf(choice), 1);
		} else {
			value.push(choice);
		}
		value = value;
	};

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value.slice();
			handle_change();
		}
	}

	$: ({ item_container } = get_styles(style, ["item_container"]));
</script>

<BlockTitle {show_label} {info}>{label}</BlockTitle>

<div class="wrap" data-testid="checkbox-group">
	{#each choices as choice}
		<label
			class:disabled
			class:selected={value.includes(choice)}
			style={item_container}
		>
			<input
				{disabled}
				on:change={() => toggleChoice(choice)}
				on:input={(evt) =>
					dispatch("select", {
						index: choices.indexOf(choice),
						value: choice,
						selected: evt.currentTarget.checked
					})}
				checked={value.includes(choice)}
				type="checkbox"
				name="test"
			/>
			<span class="ml-2">{choice}</span>
		</label>
	{/each}
</div>

<style>
	.wrap {
		display: flex;
		flex-wrap: wrap;
		gap: var(--checkbox-label-gap);
	}
	label {
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

	label:hover {
		background: var(--checkbox-label-background-fill-hover);
	}
	label:focus {
		background: var(--checkbox-label-background-fill-focus);
	}
	label.selected {
		background: var(--checkbox-label-background-fill-selected);
		color: var(--checkbox-label-text-color-selected);
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover,
	input:checked:focus {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}
</style>
