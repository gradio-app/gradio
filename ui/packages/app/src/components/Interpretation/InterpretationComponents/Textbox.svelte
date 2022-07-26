<script lang="ts">
	import { getSaliencyColor } from "../utils";

	export let interpretation: Array<[string, number]>;
</script>

<div class="input-text w-full rounded box-border p-2 break-word">
	{#each interpretation as [text, saliency]}
		<span
			class="textspan p-1 bg-opacity-20 dark:bg-opacity-80"
			style={"background-color: " + getSaliencyColor(saliency)}
		>
			{text}
		</span>
	{/each}
</div>
