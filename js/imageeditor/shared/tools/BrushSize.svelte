<script lang="ts">
	export let sizes: number[];
	export let selected_size: number;
	export let size_mode: Brush["color_mode"] | undefined = undefined;
	export let min: number;
	export let max: number;
</script>

<div class="wrap">
	{#if size_mode === "defaults"}
		<input type="range" bind:value={selected_size} {min} {max} step={1} />
	{/if}
</div>

<style>
	.wrap {
		width: 230px;
		position: absolute;
		bottom: 85px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		background: var(--background-fill-secondary);
		border: 1px solid var(--block-border-color);

		border-radius: var(--radius-md);
		box-shadow:
			0 0 5px rgba(0, 0, 0, 0.1),
			0 5px 30px rgba(0, 0, 0, 0.2);
		padding-bottom: var(--size-2);
	}
</style>
