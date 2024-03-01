<script lang="ts">
	import type { FileData } from "@gradio/client";

	export let value: null | FileData;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

{#if value}
	<div
		class="container"
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
	>
		<img src={value.url} alt="" />
	</div>
{/if}

<style>
	.container :global(img) {
		width: 100%;
		height: 100%;
	}

	.container.selected {
		border-color: var(--border-color-accent);
	}

	.container.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		overflow: hidden;
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.container.gallery {
		height: var(--size-20);
		max-height: var(--size-20);
		object-fit: cover;
	}
	.container img {
		object-fit: cover;
	}
</style>
