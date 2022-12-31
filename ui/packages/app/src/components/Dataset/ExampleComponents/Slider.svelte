<script lang="ts">
	export let value: number;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value}
</div>

<style>
	.gallery {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border-primary);
		cursor: pointer;
		padding: var(--size-2);
		border-radius: var(--radius-lg);
		font-size: var(--scale-000);
		text-align: left;
		background: var(--dataset-gallery-background-base);
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--dataset-gallery-background-hover);
	}
</style>
