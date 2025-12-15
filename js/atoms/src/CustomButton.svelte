<script lang="ts">
	import type { CustomButton } from "@gradio/utils";

	export let button: CustomButton;
	export let on_click: (id: number) => void;
</script>

<button
	class="custom-button"
	on:click={() => on_click(button.id)}
	title={button.value || ""}
	aria-label={button.value || "Custom action"}
>
	{#if button.value}
		<span class="custom-button-label">{button.value}</span>
	{/if}
</button>

<style>
	.custom-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-1);
		height: var(--size-6);
		padding: var(--size-1) var(--size-2);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--block-title-text-color);
		cursor: pointer;
		transition: all 0.2s;
		font-size: var(--text-sm);
		margin-left: var(--size-1);
	}

	.custom-button:hover {
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.custom-button-label {
		white-space: nowrap;
	}
</style>
