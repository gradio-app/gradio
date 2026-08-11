<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		aria_label?: string;
		root?: string;
		upload?: any;
		stream_handler?: any;
		children?: Snippet;
	} = $props();
</script>

<div>
	{@render children?.()}
</div>

<style>
	div {
		width: 100%;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
	}
</style>
