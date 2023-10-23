<script lang="ts">
	import { createEventDispatcher } from "svelte";
</script>

<div>
	<slot />
</div>

<style>
	div {
		display: flex;
		position: absolute;
		right: var(--size-2);
		left: var(--size-2);
		bottom: var(--size-2);
		margin: auto;
		justify-content: center;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
</style>
