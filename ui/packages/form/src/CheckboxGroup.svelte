<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: Array<string> = [];
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
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

<BlockTitle {show_label}>{label}</BlockTitle>

<div class="wrap" data-testid="checkbox-group">
	{#each choices as choice}
		<label class:disabled style={item_container}>
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
		gap: var(--size-2);
	}
	label {
		display: flex;
		align-items: center;
		cursor: pointer;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--checkbox-label-border-color-base);
		border-radius: var(--radius-lg);
		background: var(--checkbox-label-background-base);
		padding: var(--size-1-5) var(--size-3);
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-md);
	}

	label:hover {
		background: var(--checkbox-label-background-hover);
	}

	label:focus {
		background: var(--checkbox-label-background-focus);
	}
	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: 0 0 0 3px var(--ring-color), var(--shadow-drop);
		border: 1px solid var(--checkbox-border-color-base);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-base);
		font-size: var(--scale-00);
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
