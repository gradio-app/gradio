<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let original: number;
	export let interpretation: Array<number>;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let label: string = "";
</script>

<div class="input-slider">
	<BlockTitle>{label}</BlockTitle>
	<input type="range" disabled min={minimum} max={maximum} {step} />
	<div class="range">
		{#each interpretation as interpret_value}
			<div style={"background-color: " + getSaliencyColor(interpret_value)} />
		{/each}
	</div>
	<div class="original">
		{original}
	</div>
</div>

<style>
	input::-webkit-slider-thumb,
	.range::-moz-range-thumb {
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		border-radius: var(--radius-md);
		width: var(--size-5);
		height: var(--size-5);
	}

	.input-slider {
		text-align: center;
	}

	.range {
		display: flex;
	}

	input {
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		width: var(--size-full);
		height: var(--size-3);
	}

	input:hover {
		box-shadow: var(--shadow-drop-lg);
	}

	input::-webkit-slider-thumb,
	input::-moz-range-thumb {
		box-shadow: var(--shadow-drop);
		background: linear-gradient(
			to bottom,
			var(--color-orange-300),
			var(--color-orange-500)
		);
	}

	.original {
		display: inline-block;
		margin: var(--size-1) auto;
		border-radius: var(--radius-md);
		padding: var(--size-0-5) var(--size-2);
	}

	.range > div {
		flex: 1 1 0%;
		height: var(--size-4);
	}
</style>
