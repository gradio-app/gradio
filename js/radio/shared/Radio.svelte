<script context="module">
	let id = 0;
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let display_value: string;
	export let internal_value: string | number;
	export let disabled = false;
	export let selected: string | null = null;

	const dispatch = createEventDispatcher<{ input: string | number }>();
	let is_selected = false;

	async function handle_input(
		selected: string | null,
		internal_value: string | number
	): Promise<void> {
		is_selected = selected === internal_value;
		if (is_selected) {
			dispatch("input", internal_value);
		}
	}

	$: handle_input(selected, internal_value);
</script>

<label
	class:disabled
	class:selected={is_selected}
	data-testid="{display_value}-radio-label"
>
	<input
		{disabled}
		type="radio"
		name="radio-{++id}"
		value={internal_value}
		aria-checked={is_selected}
		bind:group={selected}
	/>
	<span class="ml-2">{display_value}</span>
</label>

<style>
	label {
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		box-shadow: var(--checkbox-label-shadow);
		border: var(--checkbox-label-border-width) solid
			var(--checkbox-label-border-color);
		border-radius: var(--checkbox-border-radius);
		background: var(--checkbox-label-background-fill);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-label-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	label:hover {
		background: var(--checkbox-label-background-fill-hover);
	}
	label:focus {
		background: var(--checkbox-label-background-fill-focus);
	}

	label.selected {
		background: var(--checkbox-label-background-fill-selected);
		color: var(--checkbox-label-text-color-selected);
		border-color: var(--checkbox-label-border-color-selected);
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--radius-full);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--radio-circle);
		background-color: var(--checkbox-background-color-selected);
	}

	input:checked::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background-color: white;
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input:checked:focus {
		border-color: var(--checkbox-border-color-focus);
		background-image: var(--radio-circle);
		background-color: var(--checkbox-background-color-selected);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}
</style>
