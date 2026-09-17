<script lang="ts">
	let {
		value,
		type,
		selected = false
	}: {
		value: string | null;
		type: "gallery" | "table";
		selected?: boolean;
	} = $props();
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value !== null ? value : ""}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>
