<script lang="ts">
	export let position: "column" | "row";
	export let coords: [number, number];
	export let on_click: (() => void) | null = null;

	$: is_first_position =
		position === "column" ? coords[0] === 0 : coords[1] === 0;
	$: direction =
		position === "column"
			? is_first_position
				? "down"
				: "up"
			: is_first_position
				? "right"
				: "left";
</script>

<button
	class="selection-button selection-button-{position} {is_first_position
		? `move-${direction}`
		: ''}"
	on:click|stopPropagation={() => on_click && on_click()}
	aria-label={`Select ${position}`}
>
	<span class={direction}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path
				d="m16.707 13.293-4-4a1 1 0 0 0-1.414 0l-4 4A1 1 0 0 0 8 15h8a1 1 0 0 0 .707-1.707z"
				data-name={direction}
			/>
		</svg>
	</span>
</button>

<style>
	.selection-button {
		position: absolute;
		background: var(--color-accent);
		width: var(--size-3);
		height: var(--size-5);
		color: var(--background-fill-primary);
	}

	.selection-button-column {
		top: -15px;
		left: 50%;
		transform: translateX(-50%) rotate(90deg);
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
	}

	.selection-button-row {
		left: calc(var(--size-2-5) * -1);
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
	}

	.move-down {
		bottom: -14px;
		top: auto;
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	.move-right {
		left: auto;
		right: calc(var(--size-2-5) * -1);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	svg {
		fill: currentColor;
	}

	span {
		display: flex;
		width: 100%;
		height: 100%;
	}

	.up {
		transform: rotate(-90deg);
	}

	.down {
		transform: rotate(90deg);
	}

	.left {
		transform: rotate(-90deg);
	}

	.right {
		transform: rotate(90deg);
	}
</style>
