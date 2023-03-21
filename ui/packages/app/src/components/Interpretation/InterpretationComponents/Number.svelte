<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let interpretation: Array<[number, number]>;
	export let label: string = "";
</script>

<div class="input-number">
	<BlockTitle>{label}</BlockTitle>
	<div class="range">
		{#each interpretation as interpret_value}
			<div
				class="item"
				style={"background-color: " + getSaliencyColor(interpret_value[1])}
			>
				{interpret_value[0]}
			</div>
		{/each}
	</div>
</div>

<style>
	.input-number {
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		background: var(--background-fill-secondary);
	}

	.input-number:hover {
		box-shadow: var(--shadow-drop-lg);
	}
	.range {
		display: flex;
	}

	.item {
		flex: 1 1 0%;
	}
</style>
