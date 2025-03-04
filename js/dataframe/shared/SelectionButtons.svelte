<script lang="ts">
	export let coords: [number, number];
	export let on_select_column: (col: number) => void;
	export let on_select_row: (row: number) => void;
</script>

<button
	class="selection-button selection-button-column"
	on:click|stopPropagation={() => on_select_column(coords[1])}
	aria-label="Select column"
>
	&#8942;
</button>
<button
	class="selection-button selection-button-row"
	on:click|stopPropagation={() => on_select_row(coords[0])}
	aria-label="Select row"
>
	&#8942;
</button>

<style>
	.selection-button {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent);
		color: white;
		border-radius: var(--radius-sm);
		z-index: 8;
	}

	.selection-button-column {
		width: var(--size-3);
		height: var(--size-5);
		top: -10px;
		left: var(--selected-col-pos);
		transform: rotate(90deg);
	}

	.selection-button-row {
		width: var(--size-3);
		height: var(--size-5);
		left: -7px;
		top: calc(var(--selected-row-pos) - var(--size-5) / 2);
	}
</style>
