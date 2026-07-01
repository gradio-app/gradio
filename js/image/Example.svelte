<script lang="ts">
	import Image from "./shared/Image.svelte";
	import type { FileData } from "@gradio/client";

	let {
		value,
		type,
		selected = false
	}: {
		value: null | FileData;
		type: "gallery" | "table";
		selected?: boolean;
	} = $props();
</script>

<div
	class="container"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class:border={value}
>
	{#if value}
		<Image src={value.url} alt="" />
	{/if}
</div>

<style>
	.container :global(img) {
		width: 100%;
		height: 100%;
	}

	.container.selected {
		border-color: var(--border-color-accent);
	}
	.border.table {
		border: 2px solid var(--border-color-primary);
	}

	.container.table {
		margin: 0 auto;
		border-radius: var(--radius-lg);
		overflow: hidden;
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.container.gallery {
		width: var(--size-20);
		max-width: var(--size-20);
		object-fit: cover;
	}
</style>
