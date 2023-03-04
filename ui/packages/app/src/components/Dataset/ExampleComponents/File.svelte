<script lang="ts">
	import type { FileData } from "@gradio/upload";

	export let value: FileData;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{Array.isArray(value) ? value.join(", ") : value}
</div>

<style>
	div {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.gallery {
		display: flex;
		align-items: center;
		cursor: pointer;
		background: var(--dataset-gallery-background-base);
		padding: var(--size-1) var(--size-2);
		font-size: var(--scale-00);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--dataset-gallery-background-hover);
	}
</style>
