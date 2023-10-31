<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { click_outside } from "./utils";

	export let colors: (string | [number, number, number, number])[];
	export let selected_color: number;

	const dispatch = createEventDispatcher<{
		click_outside?: never;
	}>();

	$: processed_colors = colors.map((color) => {
		if (typeof color === "string") {
			return color;
		}
		return `rgba(${color.join(",")})`;
	});
</script>

<div class="wrap" use:click_outside={() => dispatch("click_outside")}>
	<div class="grid">
		{#each processed_colors as color, i}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				on:click={() => (selected_color = i)}
				class="color"
				style="background-color: {color}"
				class:selected={i === selected_color}
			></div>
		{/each}
	</div>
</div>

<style>
	.wrap {
		position: absolute;
		bottom: 85px;
		background: var(--background-fill-secondary);
		border: 1px solid var(--block-border-color);
		padding: var(--size-1);
		border-radius: var(--radius-md);
	}
	.grid {
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: 20px 20px;
		gap: var(--size-1);
	}

	.color {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-sm);
	}

	.selected {
		border: 2px solid var(--color-accent);
	}
</style>
