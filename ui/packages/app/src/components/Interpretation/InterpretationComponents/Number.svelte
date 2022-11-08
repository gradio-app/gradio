<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let interpretation: Array<[number, number]>;
	export let label: string = "";
</script>

<div class="input-number">
	<BlockTitle>{label}</BlockTitle>
	<div class="interpret_range flex">
		{#each interpretation as interpret_value}
			<div
				class="flex-1"
				style={"background-color: " + getSaliencyColor(interpret_value[1])}
			>
				{interpret_value[0]}
			</div>
		{/each}
	</div>
</div>

<style lang="postcss" global>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input {
		-moz-appearance: textfield;
	}
	.input-number {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
