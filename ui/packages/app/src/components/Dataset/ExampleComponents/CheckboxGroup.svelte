<script lang="ts">
	export let value: Array<string>;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{#each value as check, i}{check.toLocaleString()}{#if i !== value.length - 1},&nbsp;{/if}{/each}
</div>

<style>
	.gallery {
		display: flex;
		align-items: center;
		cursor: pointer;
		border-radius: var(--radius-lg);
		background: var(--color-background-primary);
		padding: var(--size-1) var(--size-2);
		text-align: left;
	}

	.gallery:hover,
	.selected.gallery {
		background: var(--color-focus-ring);
	}
</style>
