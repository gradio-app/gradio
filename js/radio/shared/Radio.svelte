<script module>
	let id = 0;
</script>

<script lang="ts">
	import { tick } from "svelte";
	let {
		selected = $bindable(),
		display_value,
		internal_value,
		disabled,
		rtl,
		on_input
	} = $props();
	let is_selected = $derived(selected === internal_value);

	async function handle_input(
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		is_selected = e.currentTarget.checked;
		if (is_selected) {
			await tick();
			on_input();
		}
	}
</script>

<label
	class:disabled
	class:selected={is_selected}
	data-testid="{display_value}-radio-label"
	class:rtl
>
	<input
		{disabled}
		type="radio"
		name="radio-{++id}"
		value={internal_value}
		aria-checked={is_selected}
		bind:group={selected}
		oninput={handle_input}
	/>
	<span>{display_value}</span>
</label>

<style>
	label {
		position: relative;
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		border-radius: 999px;
		background: transparent;
		padding: var(--size-1-5) var(--size-4);
		color: var(--body-text-color-subdued);
		font-weight: 500;
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	label:hover:not(.selected):not(.disabled) {
		color: var(--body-text-color);
	}

	label:active:not(.disabled) {
		transform: var(--button-transform-active);
	}

	label.selected {
		background: var(--checkbox-label-background-fill-selected);
		color: var(--checkbox-label-text-color-selected);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.1),
			0 2px 6px -2px rgb(0 0 0 / 0.1);
	}

	label:has(input:focus-visible) {
		outline: 2px solid var(--input-border-color-focus);
		outline-offset: 1px;
	}

	/* The native radio stays focusable and announced; the segment shows its state. */
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}

	.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
