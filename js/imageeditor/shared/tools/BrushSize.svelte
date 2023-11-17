<script lang="ts">
	import type { Brush } from "./Brush.svelte";
	import { createEventDispatcher } from "svelte";
	export let sizes: number[];
	export let selected_size: number;
	export let size_mode: Brush["color_mode"] | undefined = undefined;
	export let min: number;
	export let max: number;

	$: console.log(sizes, selected_size, size_mode);

	const dispatch = createEventDispatcher<{
		select: { index: number; size: number };
	}>();

	function handle_select(detail: { index: number; size: number }): void {
		dispatch("select", detail);
		selected_size = detail.size;
	}
</script>

<div class="wrap">
	{#if size_mode === "defaults"}
		<input type="range" bind:value={selected_size} {min} {max} step={1} />
	{/if}
	<div class="swatch">
		{#each sizes as size, i}
			<button
				on:click={() => handle_select({ index: i, size })}
				class="color"
				class:selected={size === selected_size}
				style:width="{20 + 2 * i}px"
				style:height="{20 + 2 * i}px"
			>
				{size}
			</button>
		{/each}
	</div>
</div>

<style>
	.wrap {
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
		padding: var(--size-2);
	}

	button {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.8);
		opacity: 0.5;
		color: #fff;
	}

	.selected {
		opacity: 1;
		background-color: rgba(0, 0, 0, 1);
	}

	.swatch {
		display: flex;
		width: 100%;
		gap: var(--size-2);
		justify-content: center;
		align-items: center;
		margin-bottom: var(--size-1);
	}

	input {
		margin-bottom: var(--size-2);
	}
</style>
