<script lang="ts">
	export let value: string;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class="prose"
>
	{@html value}
</div>

<style>
	.gallery {
		display: flex;
		align-items: center;
		cursor: pointer;
		border-radius: var(--rounded-lg);
		background: var(--color-background-primary);
		padding: var(--size-2);
		font-size: var(--scale-000);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--color-focus-ring);
	}
</style>
