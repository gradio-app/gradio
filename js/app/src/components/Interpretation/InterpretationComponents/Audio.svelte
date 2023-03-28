<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";
	export let interpretation: Array<number>;
	export let label: string = "";
</script>

<div>
	<BlockTitle>{label}</BlockTitle>
	<div class="range">
		{#each interpretation as interpret_value}
			<div
				class="item"
				style={"background-color: " + getSaliencyColor(interpret_value)}
			/>
		{/each}
	</div>
</div>

<style>
	.range {
		display: flex;
	}

	.item {
		display: flex;
		height: var(--size-4);
	}
</style>
