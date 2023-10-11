<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let value: boolean;
	export let disabled: boolean;

	const dispatch = createEventDispatcher<{ change: boolean }>();
</script>

<input
	bind:checked={value}
	type="checkbox"
	on:click={() => dispatch("change", value)}
	on:keydown={({ key }) =>
		(key === " " || key === "Enter") && dispatch("change", value)}
	{disabled}
	class:disabled={disabled && !value}
/>

<style>
	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--input-shadow);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--radius-xs);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
		width: 18px !important;
		height: 18px !important;
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

	.disabled {
		cursor: not-allowed;
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:disabled:checked,
	input:disabled:checked:hover,
	.disabled:checked:focus {
		opacity: 0.8 !important;
		cursor: not-allowed;
	}
</style>
