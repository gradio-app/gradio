<script lang="ts">
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	style="background-color: {value}"
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
