<script lang="ts">
	export let on_click: () => void;
</script>

<button class="add-row-button" on:click={on_click} aria-label="Add row">
	+
</button>

<style>
	.add-row-button {
		width: 100%;
		padding: var(--size-1);
		background: transparent;
		border: 1px dashed var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		cursor: pointer;
		transition: all 150ms;
		margin-top: var(--size-2);
		z-index: 10;
		position: relative;
		pointer-events: auto;
	}

	.add-row-button:hover {
		background: var(--background-fill-secondary);
		border-style: solid;
	}
</style>
