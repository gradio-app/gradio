<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let label: string = "";
	export let original: boolean;
	export let interpretation: [number, number];
</script>

<div class="input-checkbox">
	<BlockTitle>{label}</BlockTitle>
	<button class="checkbox-item" class:selected={original}>
		<div
			class="checkbox"
			style={"background-color: " + getSaliencyColor(interpretation[0])}
		/>
		<div
			class="checkbox"
			style={"background-color: " + getSaliencyColor(interpretation[1])}
		>
			<svg viewBox="-10 -10 20 20">
				<line
					x1="-7.5"
					y1="0"
					x2="-2.5"
					y2="5"
					stroke="black"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<line
					x1="-2.5"
					y1="5"
					x2="7.5"
					y2="-7.5"
					stroke="black"
					stroke-width="4"
					stroke-linecap="round"
				/>
			</svg>
		</div>
	</button>
</div>

<style lang="postcss">
	.input-checkbox {
		display: inline-block;
	}

	svg {
		width: var(--size-4);
		height: var(--size-3);
	}
	.selected svg {
		opacity: 1;
	}
	.input-checkbox {
		display: flex;
		gap: var(--size-1);
		cursor: pointer;
		border-radius: var(--radius-md);
		padding: var(--size-2) var(--size-3);
	}

	.checkbox {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--border-color-primary);
		background: var(--background-fill-primary);
		width: var(--size-4);
		height: var(--size-4);
	}

	.checkbox-item {
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		background: var(--background-fill-primary);
	}

	.checkbox-item:hover {
		box-shadow: var(--shadow-drop-lg);
	}
	.checkbox-item.selected {
		background: var(--color-accent-base);
		color: white;
	}
</style>
