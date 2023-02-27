<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: string;
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean = true;
	export let elem_id: string;

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);

	$: ({ item_container } = get_styles(style, ["item_container"]));
</script>

<BlockTitle {show_label} {info}>{label}</BlockTitle>

<div class="wrap">
	{#each choices as choice, i (i)}
		<label
			class:disabled
			class:selected={value === choice}
			style={item_container}
		>
			<input
				{disabled}
				bind:group={value}
				type="radio"
				name="radio-{elem_id}"
				value={choice}
			/>
			<span class="ml-2">{choice}</span>
		</label>
	{/each}
</div>

<style>
	.wrap {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}
	label {
		display: flex;
		align-items: center;
		cursor: pointer;
		box-shadow: var(--checkbox-label-shadow);
		border: var(--checkbox-label-border-width) solid
			var(--checkbox-label-border-color-base);
		border-radius: var(--radius-button-small);
		background: var(--checkbox-label-background-base);
		padding: var(--spacing-md) var(--spacing-xl);
		color: var(--checkbox-color-text);
		font-size: var(--text-xs);
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
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--input-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color-base);
		border-radius: var(--radius-full);
		background-color: var(--checkbox-background-base);
		font-size: var(--text-xs);
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
		--ring-color: var(--color-focus-ring);
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
