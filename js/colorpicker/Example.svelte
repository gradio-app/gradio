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
	style="background-color: {value ? value : 'black'}"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
/>

<style>
	div {
		width: var(--size-10);
		height: var(--size-10);
	}
	.table {
		margin: 0 auto;
	}
</style>
