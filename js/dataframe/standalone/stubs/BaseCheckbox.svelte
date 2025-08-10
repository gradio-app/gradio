<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value = false;
	export let label = "";
	export let interactive = true;
	export let disabled = false;

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handleChange(event: Event): void {
		if (!interactive || disabled) return;
		const target = event.target as HTMLInputElement;
		const newValue = target.checked;
		value = newValue;
		dispatch("change", newValue);
	}
</script>

<label class="checkbox-wrapper" class:disabled>
	<div class="checkbox-container">
		<input
			type="checkbox"
			class="checkbox-input"
			bind:checked={value}
			{disabled}
			on:change={handleChange}
		/>
		<div class="checkbox-custom" class:checked={value}>
			{#if value}
				<svg
					class="check-icon"
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M10 3L4.5 8.5L2 6"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</div>
	</div>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: flex;
		align-items: center;
		gap: var(--size-2, 8px);
		cursor: pointer;
		user-select: none;
	}

	.checkbox-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.checkbox-container {
		position: relative;
		display: inline-block;
	}

	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		margin: 0;
		cursor: pointer;
	}

	.checkbox-input:disabled {
		cursor: not-allowed;
	}

	.checkbox-custom {
		width: var(--size-4, 16px);
		height: var(--size-4, 16px);
		border: 2px solid var(--border-color-primary, #d1d5db);
		border-radius: var(--radius-sm, 4px);
		background: var(--background-fill-primary, #ffffff);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.checkbox-custom.checked {
		background: var(--color-accent, #6366f1);
		border-color: var(--color-accent, #6366f1);
	}

	.check-icon {
		width: 12px;
		height: 12px;
		color: white;
		stroke: white;
		stroke-width: 2;
	}

	.checkbox-label {
		font-size: var(--text-sm, 14px);
		line-height: var(--line-sm, 1.25);
		color: var(--body-text-color, #374151);
	}

	.checkbox-input:focus + .checkbox-custom {
		outline: 2px solid var(--color-accent, #6366f1);
		outline-offset: 2px;
	}

	.checkbox-wrapper.disabled .checkbox-custom {
		background: var(--background-fill-tertiary, #f3f4f6);
		border-color: var(--border-color-tertiary, #e5e7eb);
		opacity: 0.5;
	}

	.checkbox-wrapper.disabled .checkbox-custom.checked {
		background: var(--border-color-tertiary, #e5e7eb);
		border-color: var(--border-color-tertiary, #e5e7eb);
	}
</style>
