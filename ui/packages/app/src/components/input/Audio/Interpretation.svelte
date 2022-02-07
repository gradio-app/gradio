<script lang="ts">
	import type { Value } from "./types";

	import { getSaliencyColor } from "../../utils/helpers";
	export let value: Value;
	export let interpretation: Array<number>;
	export let theme: string;

	$: console.log({ value, interpretation, theme });
</script>

<div class="input-audio" {theme}>
	<audio class="w-full" controls>
		<source src={value.data} />
	</audio>
	<div class="interpret_range flex">
		{#each interpretation as interpret_value}
			<div
				class="flex-1 h-4"
				style={"background-color: " + getSaliencyColor(interpret_value)}
			/>
		{/each}
	</div>
</div>

<style lang="postcss">
</style>
