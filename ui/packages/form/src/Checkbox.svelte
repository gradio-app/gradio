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
	/>
	<span class="ml-2">{label}</span></label
>

<style>
	label {
		display: flex;
		align-items: center;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-md);
		cursor: pointer;
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
		border-radius: var(--checkbox-border-radius);
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
