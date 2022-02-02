<script>
	import { getSaliencyColor } from "../../utils/helpers";
	export let value, interpretation, theme;
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
