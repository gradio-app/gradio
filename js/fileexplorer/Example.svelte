<script lang="ts">
	import type { FileData } from "@gradio/client";

	export let value: string[] | string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<ul
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{#each Array.isArray(value) ? value.slice(0, 3) : [value] as path}
		<li><code>./{path}</code></li>
	{/each}
	{#if Array.isArray(value) && value.length > 3}
		<li class="extra">...</li>
	{/if}
</ul>

<style>
	ul {
		white-space: nowrap;
		max-height: 100px;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.extra {
		text-align: center;
	}

	.gallery {
		align-items: center;
		cursor: pointer;
		padding: var(--size-1) var(--size-2);
		text-align: left;
	}
</style>
