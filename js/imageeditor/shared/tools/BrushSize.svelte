<script lang="ts">
	import { click_outside } from "../utils/events";
	import { createEventDispatcher } from "svelte";

	export let selected_size: number;
	export let min: number;
	export let max: number;

	const dispatch = createEventDispatcher<{
		click_outside: void;
	}>();

	let width = 0;
	let height = 0;
	let c_width = 0;
	let c_height = 0;
	let wrap_el: HTMLDivElement;
	let anchor_right = false;
	let anchor_top = false;

	$: {
		if (wrap_el && (width || height || c_height || c_width)) {
			const box = wrap_el.getBoundingClientRect();

			anchor_right = box.width + 30 > width / 2;
			anchor_top = box.y < 80;
		}
	}
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<div
	class="wrap"
	use:click_outside={() => dispatch("click_outside")}
	bind:this={wrap_el}
	bind:clientWidth={c_width}
	bind:clientHeight={c_height}
	class:right={anchor_right}
	class:top={anchor_top}
	class:bottom={!anchor_top}
>
	<input type="range" bind:value={selected_size} {min} {max} step={1} />
</div>

<style>
	.wrap {
		width: 180px;
		position: absolute;
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
		cursor: default;
	}

	.bottom {
		bottom: 85px;
	}

	.top {
		top: 30px;
	}

	.right {
		right: 10px;
	}
</style>
