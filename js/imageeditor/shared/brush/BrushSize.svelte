<script lang="ts">
	import { click_outside } from "../utils/events";
	import { createEventDispatcher } from "svelte";
	import { BrushSize } from "@gradio/icons";

	export let selected_size: number;
	export let min: number;
	export let max: number;

	const dispatch = createEventDispatcher<{
		click_outside: void;
	}>();
</script>

<div class="wrap" use:click_outside={() => dispatch("click_outside")}>
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
