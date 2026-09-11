<script lang="ts">
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let { children }: { children?: Snippet } = $props();
	const ready = Promise.resolve();

	setContext("custom-component-context", "provided by parent");
</script>

{#await ready then}
	{@render children?.()}
{/await}
