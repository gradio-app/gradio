<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import type { CheckboxProps, CheckboxEvents } from "../types";

	let {
		value,
		interactive = true,
		label,
		on_change,
		on_select,
		on_input,
		show_label = true
	} = $props();
	// const gradio: Gradio<CheckboxEvents, CheckboxProps> = props.gradio;

	let disabled = $derived(!interactive);

	let old_value = value;

	// $inspect(gradio?.props);

	$effect(() => {
		if (old_value !== value) {
			old_value = value;
			on_change($state.snapshot(value));
		}
	});

	async function handle_enter(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		if (event.key === "Enter") {
			value = !value;
			on_select({
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
		on_select({
			index: 0,
			value: event.currentTarget.checked,
			selected: event.currentTarget.checked
		});
		on_input();
	}
</script>

<label class="checkbox-container">
	<input
		bind:checked={value}
		on:keydown={handle_enter}
		on:input={handle_input}
		{disabled}
		type="checkbox"
		name="test"
		data-testid="checkbox"
	/>
	{#if label && show_label}
		<span class="label-text">
			{label}
		</span>
	{/if}
</label>

<style>
	.checkbox-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		cursor: pointer;
	}

	.label-text {
		color: var(--body-text-color);
		font-size: var(--text-sm);
		line-height: var(--line-sm);
	}

	.info {
		display: block;
		color: var(--body-text-color-subdued);
		font-size: var(--text-xs);
		margin-top: var(--spacing-xs);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
		flex-shrink: 0;
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

	input[disabled] {
		cursor: not-allowed;
	}

	input:not([disabled]):hover {
		cursor: pointer;
	}
</style>
