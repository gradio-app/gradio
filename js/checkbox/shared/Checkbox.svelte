<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import type { CheckboxProps, CheckboxEvents } from "../types";

	const props = $props();
	const gradio: Gradio<CheckboxEvents, CheckboxProps> = props.gradio;

	let disabled = $derived(!gradio.shared.interactive);

	let old_value = $state(gradio.props.value);
	let label = $derived(gradio.shared.label || gradio.i18n("checkbox.checkbox"));

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change", $state.snapshot(gradio.props.value));
		}
	});

	async function handle_enter(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		if (event.key === "Enter") {
			gradio.props.value = !gradio.props.value;
			gradio.dispatch("select", {
				index: 0,
				value: event.currentTarget.checked,
				selected: event.currentTarget.checked
			});
		}
	}

	async function handle_input(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		gradio.props.value = event.currentTarget.checked;
		gradio.dispatch("select", {
			index: 0,
			value: event.currentTarget.checked,
			selected: event.currentTarget.checked
		});
		gradio.dispatch("input");
	}
</script>

<label class="checkbox-container" class:disabled>
	<input
		bind:checked={gradio.props.value}
		on:keydown={handle_enter}
		on:input={handle_input}
		{disabled}
		type="checkbox"
		name="test"
		data-testid="checkbox"
	/>
	{#if gradio.shared.show_label}
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
		font-size: var(--checkbox-label-text-size);
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
		opacity: 0.75;
	}

	label.disabled {
		cursor: not-allowed;
	}

	input:not([disabled]):hover {
		cursor: pointer;
	}
</style>
