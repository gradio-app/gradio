<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children?: Snippet } = $props();
	const value = Promise.resolve("hello");
</script>

{#await value then resolved}
	<div>
		{resolved}
		{@render children?.()}
	</div>
{/await}
