<script lang="ts" context="module">
	export type Position =
		| "top-left"
		| "top"
		| "top-right"
		| "left"
		| "center"
		| "right"
		| "bottom-left"
		| "bottom"
		| "bottom-right";
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Spring } from "svelte/motion";
	import Anchor from "./Anchor.svelte";

	export let dimensions: Spring<{ width: number; height: number }>;

	const dispatch = createEventDispatcher<{
		change: { anchor: Position; scale: boolean; width: number; height: number };
	}>();

	let selected_anchor: Position = "center";
	let scale = false;

	let new_width = $dimensions?.width;
	let new_height = $dimensions?.height;

	function handle_click(): void {
		dispatch("change", {
			anchor: selected_anchor,
			scale,
			width: new_width,
			height: new_height,
		});
	}

	function set_anchor(position: Position): void {
		selected_anchor = position;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrap" on:click|stopPropagation>
	<div class="size-wrap">
		<label for="width">Width</label><input
			type="number"
			id="width"
			bind:value={new_width}
		/>
		<label for="height">Height </label><input
			type="number"
			id="height"
			bind:value={new_height}
		/>

		<h2 class="image-will-label">Image will:</h2>
		<div class="toggle-container">
			<label class="radio-label">
				<input
					type="radio"
					name="resize_mode"
					value={true}
					bind:group={scale}
				/>
				<span class="radio-button">rescale</span>
			</label>
			<label class="radio-label">
				<input
					type="radio"
					name="resize_mode"
					value={false}
					bind:group={scale}
				/>
				<span class="radio-button">anchor</span>
			</label>
		</div>
	</div>
	<div class="anchor-wrap">
		<Anchor on:position={(e) => set_anchor(e.detail)} />
	</div>
	<button class="apply-button" on:click={() => handle_click()}
		>Resize Canvas</button
	>
</div>

<style>
	.wrap {
		border-radius: 4px;
		border: 1px solid #ccc;
		width: 240px;
		position: absolute;
		top: calc(100% + var(--spacing-xxs) + 2px);
		right: 0;
		background: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--spacing-sm);
		box-shadow: var(--shadow-drop);
		font-size: 12px;
		z-index: var(--layer-2);
		color: var(--block-label-text-color);
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		height: auto !important;
	}

	.size-wrap {
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-template-columns: auto 1fr;
		padding: 10px;
		row-gap: 10px;
		column-gap: 15px;
	}
	label,
	h2 {
		display: flex;
		align-items: center;
		gap: 15px;

		cursor: pointer;
		color: var(--checkbox-label-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	input[type="number"] {
		border: 1px solid var(--border-color-primary);
		width: 100px;
		border-radius: var(--radius-sm);
		background-color: var(--checkbox-background-color-focus);
		color: var(--body-text-color);
		font-size: var(--text-sm);
		transition: border-color 0.15s ease;
		padding: var(--spacing-sm);
	}

	input[type="number"]:hover {
		border-color: var(--color-accent-soft);
	}

	input[type="number"]:focus {
		border-color: var(--color-accent);
		outline: none;
		box-shadow: 0 0 0 1px var(--color-accent-soft);
	}

	.image-will-label {
		grid-column: 1;
	}

	.toggle-container {
		display: flex;
		grid-column: 2;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color-primary);
		overflow: hidden;
	}

	.toggle-container {
		display: flex;
		grid-column: 2;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color-primary);
		overflow: hidden;
	}

	.radio-label {
		flex: 1;
		margin: 0;
		padding: 0;
		position: relative;
		cursor: pointer;
	}

	.radio-button {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--spacing-sm);
		background: var(--checkbox-background-color);
		color: var(--body-text-color);
		font-size: var(--text-sm);
		transition: background-color 0.15s ease;
		width: 100%;
		height: 100%;
	}

	input[type="radio"] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	input[type="radio"]:not(:checked) + .radio-button:hover {
		background: var(--checkbox-background-color-hover);
	}

	input[type="radio"]:checked + .radio-button {
		background: var(--color-accent);
		color: white;
	}

	.apply-button {
		width: 100%;
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		transition: all 0.15s ease;
	}

	.apply-button:hover {
		background: var(--button-primary-background-fill-hover);
	}

	.anchor-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 10px;
	}
</style>
