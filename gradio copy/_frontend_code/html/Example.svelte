<script lang="ts">
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
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
		padding: var(--size-2);
	}
</style>
