<script lang="ts">
	import { svgCopy, svgCheck } from "$lib/assets/copy.js";

	let {
		content = ""
	}: {
		content?: string;
	} = $props();

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<button onclick={copy} class="clipboard-button m-2" role="button" tabindex={0}>
	{#if !copied}
		{@html svgCopy}
	{:else}
		{@html svgCheck}
	{/if}
</button>
