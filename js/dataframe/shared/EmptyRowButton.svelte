<script lang="ts">
	export let on_click: () => void;
</script>

<div class="add-row-container">
	<button class="add-row-button" on:click={on_click}>
		<span>+</span>
	</button>
</div>

<style>
	.add-row-container {
		margin-top: var(--size-2);
	}

	.add-row-button {
		width: 100%;
		padding: var(--size-1);
		background: transparent;
		border: 1px dashed var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		cursor: pointer;
		transition: all 150ms;
	}

	.add-row-button:hover {
		background: var(--background-fill-secondary);
		border-style: solid;
	}
</style>
