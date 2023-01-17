<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: boolean;
	export let disabled: boolean = false;
	export let label: string;

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handle_change(
		evt: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		value = evt.currentTarget.checked;
		dispatch("change", value);
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class:disabled>
	<input
		on:change={(evt) => handle_change(evt)}
		{disabled}
		checked={value}
		type="checkbox"
		name="test"
		data-testid="checkbox"
	/>
	<span class="ml-2">{label}</span>
</label>

<style>
	label {
		display: flex;
		align-items: center;
		cursor: pointer;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-md);
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
