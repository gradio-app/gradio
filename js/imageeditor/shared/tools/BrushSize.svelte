<script lang="ts">
	import { click_outside } from "../utils/events";
	import { createEventDispatcher } from "svelte";

	export let selected_size: number;
	export let min: number;
	export let max: number;

	const dispatch = createEventDispatcher<{
		click_outside: void;
	}>();
</script>

<div class="wrap" use:click_outside={() => dispatch("click_outside")}>
	<input type="range" bind:value={selected_size} {min} {max} step={1} />
</div>

<style>
	.wrap {
		width: 180px;
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
</style>
