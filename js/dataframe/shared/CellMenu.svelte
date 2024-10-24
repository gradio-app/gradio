<script lang="ts">
	import { onMount } from "svelte";
	import Arrow from "./Arrow.svelte";
	import type { I18nFormatter } from "js/utils/src";

	export let x: number;
	export let y: number;
	export let on_add_row_above: () => void;
	export let on_add_row_below: () => void;
	export let on_add_column_left: () => void;
	export let on_add_column_right: () => void;
	export let row: number;
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];

	export let i18n: I18nFormatter;
	let menu_element: HTMLDivElement;

	$: is_header = row === -1;
	$: can_add_rows = row_count[1] === "dynamic";
	$: can_add_columns = col_count[1] === "dynamic";

	onMount(() => {
		position_menu();
	});

	function position_menu(): void {
		if (!menu_element) return;

		const viewport_width = window.innerWidth;
		const viewport_height = window.innerHeight;
		const menu_rect = menu_element.getBoundingClientRect();

		let new_x = x - 30;
		let new_y = y - 20;

		if (new_x + menu_rect.width > viewport_width) {
			new_x = x - menu_rect.width + 10;
		}

		if (new_y + menu_rect.height > viewport_height) {
			new_y = y - menu_rect.height + 10;
		}

		menu_element.style.left = `${new_x}px`;
		menu_element.style.top = `${new_y}px`;
	}
</script>

<div bind:this={menu_element} class="cell-menu">
	{#if !is_header && can_add_rows}
		<button on:click={() => on_add_row_above()}>
			<Arrow transform="rotate(-90 12 12)" />
			{i18n("dataframe.add_row_above")}
		</button>
		<button on:click={() => on_add_row_below()}>
			<Arrow transform="rotate(90 12 12)" />
			{i18n("dataframe.add_row_below")}
		</button>
	{/if}
	{#if can_add_columns}
		<button on:click={() => on_add_column_left()}>
			<Arrow transform="rotate(180 12 12)" />
			{i18n("dataframe.add_column_left")}
		</button>
		<button on:click={() => on_add_column_right()}>
			<Arrow transform="rotate(0 12 12)" />
			{i18n("dataframe.add_column_right")}
		</button>
	{/if}
</div>

<style>
	.cell-menu {
		position: fixed;
		z-index: var(--layer-2);
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		box-shadow: var(--shadow-drop-lg);
		min-width: 150px;
	}

	.cell-menu button {
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: var(--size-1) var(--size-2);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		font-size: var(--text-sm);
		transition:
			background-color 0.2s,
			color 0.2s;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.cell-menu button:hover {
		background-color: var(--background-fill-secondary);
	}

	.cell-menu button :global(svg) {
		fill: currentColor;
		transition: fill 0.2s;
	}

	.cell-menu button:hover :global(svg) {
		fill: var(--color-accent);
	}
</style>
