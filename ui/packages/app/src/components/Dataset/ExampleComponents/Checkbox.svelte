<script lang="ts">
	export let value: boolean;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value.toLocaleString()}
</div>

<style>
	div {
		font-size: var(--scale-000);
		font-family: var(--font-mono);
	}
	.gallery {
		display: flex;
		align-items: center;
		cursor: pointer;
		border-radius: var(--rounded-lg);
		padding: var(--size-1) var(--size-2);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--color-focus-ring);
	}
</style>
