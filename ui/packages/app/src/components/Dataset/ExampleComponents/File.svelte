<script lang="ts">
	import type { FileData } from "../../File/types";

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
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		background: var(--dataset-gallery-background-base);
		padding: var(--size-2);
		font-size: var(--scale-000);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--dataset-gallery-background-hover);
	}
</style>
