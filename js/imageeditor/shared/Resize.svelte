<script lang="ts" context="module">
	export type Anchor =
		| "top-left"
		| "top-center"
		| "top-right"
		| "middle-left"
		| "center"
		| "middle-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Spring } from "svelte/motion";

	const anchors = [
		{ label: "Top Left", code: "top-left" },
		{ label: "Top Center", code: "top-center" },
		{ label: "Top Right", code: "top-right" },
		{ label: "Middle Left", code: "middle-left" },
		{ label: "Center", code: "center" },
		{ label: "Middle Right", code: "middle-right" },
		{ label: "Bottom Left", code: "bottom-left" },
		{ label: "Bottom Center", code: "bottom-center" },
		{ label: "Bottom Right", code: "bottom-right" },
	] as const;

	export let dimensions: Spring<{ width: number; height: number }>;

	const dispatch = createEventDispatcher<{
		change: { anchor: Anchor; scale: boolean; width: number; height: number };
	}>();

	let selected_anchor: Anchor = "center";
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
		<label for="scale">Scale</label><input
			type="checkbox"
			bind:checked={scale}
		/>
	</div>
	<div class="anchor-wrap">
		{#each anchors as { label, code }}
			<button
				class="anchor-button"
				on:click={() => (selected_anchor = code)}
				class:selected={selected_anchor === code}>{label}</button
			>
		{/each}
	</div>

	<button class="apply-button" on:click={() => handle_click()}>Apply</button>
</div>

<style>
	.wrap {
		border-radius: 4px;
		border: 1px solid #ccc;
		width: 230px;
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
	label {
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

	.anchor-wrap {
		margin: auto;
		display: grid;
		width: 120px;
		height: 120px;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(3, 1fr);
		border-radius: 5px;
		border: 1px solid var(--border-color-primary);
		overflow: hidden;
		margin: var(--spacing-sm) auto;
		margin-bottom: 10px;
	}

	.anchor-button {
		border: none;
		background: none;
		font-size: 1px;
		color: transparent;
		border-color: var(--border-color-primary);
		border-style: solid;
		border-width: 0;
		cursor: pointer;
		margin-right: 0 !important;
		margin: 0 !important;
		border-radius: 0 !important;
		position: static !important;
	}

	.anchor-button:nth-of-type(3n),
	button:nth-of-type(3n-1) {
		border-left-width: 1px;
		/* background: pink; */
	}

	.anchor-button:nth-of-type(-n + 6) {
		border-bottom-width: 1px;
		/* background: pink; */
	}

	.anchor-button:hover {
		background: var(--background-fill-secondary);
	}

	.anchor-button.selected {
		background: var(--color-accent);
	}

	/* label > * + * {
		margin-left: var(--size-2);
	} */

	input[type="checkbox"] {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
		align-self: center;
	}

	input:checked,
	input:checked:hover,
	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input:hover {
		cursor: pointer;
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
		background: var(--color-accent-soft);
	}
</style>
