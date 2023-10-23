<script lang="ts">
	import { svgCopy, svgCheck } from "$lib/assets/copy.js";

	export let content: string = "";

	let copied = false;
	async function copy() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<button on:click={copy} class="clipboard-button m-2" role="button" tabindex={0}>
	{#if !copied}
		{@html svgCopy}
	{:else}
		{@html svgCheck}
	{/if}
</button>
