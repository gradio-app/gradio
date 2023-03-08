<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle, Info } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: Array<string> = [];
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: Array<string> }>();

	const toggleChoice = (choice: string) => {
		if (value.includes(choice)) {
			value.splice(value.indexOf(choice), 1);
		} else {
			value.push(choice);
		}
		dispatch("change", value);
		value = value;
	};

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
		background: var(--checkbox-label-background);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	label:hover {
		background: var(--checkbox-label-background-hover);
	}
	label:focus {
		background: var(--checkbox-label-background-focus);
	}
	label.selected {
		background: var(--checkbox-label-background-selected);
		color: var(--checkbox-text-color-selected);
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
		background-color: var(--checkbox-background);
		line-height: var(--line-sm);
	}

	input:checked {
		border-color: var(--checkbox-border-color-selected);
		background-color: var(--checkbox-background-selected);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-focus);
	}

	input:checked:focus {
		border-color: var(--checkbox-background-selected);
		background-color: var(--checkbox-background-selected);
	}

	input:checked:hover {
		border-color: var(--checkbox-background-selected);
		background-color: var(--checkbox-background-selected);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}
</style>
