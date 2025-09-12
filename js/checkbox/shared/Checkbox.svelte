<script lang="ts">
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let value = false;
	export let label = "Checkbox";
	export let interactive: boolean;
	export let indeterminate = false;

	const dispatch = createEventDispatcher<{
		change: boolean;
		select: SelectData;
	}>();

	// When the value changes, dispatch the change event via handle_change()
	// See the docs for an explanation: https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
	$: value, dispatch("change", value);
	$: disabled = !interactive;

	async function handle_enter(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		if (event.key === "Enter") {
			value = !value;
			dispatch("select", {
				index: 0,
				value: event.currentTarget.checked,
				selected: event.currentTarget.checked
			});
		}
	}

	async function handle_input(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		value = event.currentTarget.checked;
		dispatch("select", {
			index: 0,
			value: event.currentTarget.checked,
			selected: event.currentTarget.checked
		});
	}
</script>

<label class:disabled>
	<input
		bind:checked={value}
		bind:indeterminate
		on:keydown={handle_enter}
		on:input={handle_input}
		{disabled}
		type="checkbox"
		name="test"
		data-testid="checkbox"
	/>
	<span>{label}</span>
</label>

<style>
	label {
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		color: var(--checkbox-label-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover,
	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input:indeterminate {
		background-image: none;
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
		position: relative;
	}

	input:indeterminate::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 2px;
		background-color: white;
	}

	input:indeterminate:hover {
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-hover);
	}

	input:indeterminate:focus {
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed !important;
	}

	input:hover {
		cursor: pointer;
	}
</style>
