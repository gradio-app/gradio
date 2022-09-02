<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";
	export let interpretation: Array<number>;
	export let label: string;
</script>

<div class="input-audio">
	<BlockTitle>{label}</BlockTitle>
	<div class="interpret_range flex">
		{#each interpretation as interpret_value}
			<div
				class="flex-1 h-4"
				style={"background-color: " + getSaliencyColor(interpret_value)}
			/>
		{/each}
	</div>
</div>
