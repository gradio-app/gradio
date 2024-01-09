<script lang="ts">
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
	export let choices: [string, string | number][];
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
		padding: var(--size-1) var(--size-2);
	}
</style>
