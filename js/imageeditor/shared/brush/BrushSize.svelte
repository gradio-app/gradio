<script lang="ts">
	import { click_outside } from "../utils/events";
	import { BrushSize } from "@gradio/icons";

	let {
		selected_size = $bindable(),
		min,
		max,
		onclick_outside = () => {}
	}: {
		selected_size: number;
		min: number;
		max: number;
		onclick_outside?: (event: MouseEvent) => void;
	} = $props();
</script>

<div class="wrap" use:click_outside={onclick_outside}>
	<span>
		<BrushSize />
	</span>
	<input type="range" bind:value={selected_size} {min} {max} step={1} />
</div>

<style>
	.wrap {
		width: 230px;
		display: flex;
		gap: var(--size-4);
		background: var(--background-fill-secondary);
		padding: 0 var(--size-4);
		cursor: default;
		padding-top: var(--size-2-5);
	}

	input {
		width: 100%;
	}
	span {
		width: 26px;
		color: var(--body-text-color);
	}
</style>
