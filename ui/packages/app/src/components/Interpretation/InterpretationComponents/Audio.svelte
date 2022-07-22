<script lang="ts">
	import { getSaliencyColor } from "../utils";
	export let interpretation: Array<number>;
</script>

<div class="input-audio">
	<div class="interpret_range flex">
		{#each interpretation as interpret_value}
			<div
				class="flex-1 h-4"
				style={"background-color: " + getSaliencyColor(interpret_value)}
			/>
		{/each}
	</div>
</div>
