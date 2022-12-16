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
	export let show_label: boolean = true;
	export let elem_id: string;

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);

	$: ({ item_container } = get_styles(style, ["item_container"]));
</script>

<BlockTitle {show_label}>{label}</BlockTitle>

<div class="wrap">
	{#each choices as choice, i (i)}
		<label class:disabled class={item_container}>
			<input
				{disabled}
				bind:group={value}
				type="radio"
				name="radio-{elem_id}"
				value={choice}
			/> <span class="ml-2">{choice}</span></label
		>
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
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-md);
		cursor: pointer;
		border-radius: var(--checkbox-label-border-radius);
		box-shadow: var(--checkbox-label-shadow);
		padding: var(--size-1-5) var(--size-3);
		border: 1px solid var(--checkbox-label-border-color-base);
		background: var(--checkbox-label-background-base);
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
		box-shadow: 0 0 0 3px var(--ring-color), var(--input-shadow);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
		border: 1px solid var(--checkbox-border-color-base);
		background-color: var(--checkbox-background-base);
		border-radius: var(--radius-full);
	}

	input:focus {
		--ring-color: var(--color-focus-ring);
		background-color: var(--checkbox-background-color-focus);
		border-color: var(--checkbox-border-color-focus);
	}

	input:checked {
		background-color: var(--checkbox-background-selected);
		border-color: var(--checkbox-border-color-selected);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}
</style>
