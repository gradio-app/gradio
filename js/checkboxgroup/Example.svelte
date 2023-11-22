<script lang="ts">
	export let value: string[];
	export let type: "gallery" | "table";
	export let selected = false;
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
		padding: var(--size-1) var(--size-2);
	}
</style>
