<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";
	export let label: string = "";
	export let interpretation: Array<[string, number]>;
</script>

<div class="input-text">
	<BlockTitle>{label}</BlockTitle>
	{#each interpretation as [text, saliency]}
		<span
			class="text-span"
			style={"background-color: " + getSaliencyColor(saliency)}
		>
			{text}
		</span>
	{/each}
</div>

<style>
	.input-text {
		border-radius: var(--radius-md);
		padding: var(--size-2);
		width: var(--size-full);
		overflow-wrap: break-word;
	}

	.text-span {
		padding: var(--size-1);
	}
</style>
