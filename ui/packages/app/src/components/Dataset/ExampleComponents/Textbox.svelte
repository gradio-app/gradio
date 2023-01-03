<script lang="ts">
	export let value: string;
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
		cursor: pointer;
		border-radius: var(--radius-lg);
		background: var(--dataset-gallery-background-base);
		padding: var(--size-2);
		font-size: var(--scale-00);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--dataset-gallery-background-hover);
	}
</style>
