<script lang="ts">
	export let value: string | null;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<pre
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected>{value ? value : ""}</pre>

<style>
	pre {
		text-align: left;
	}
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>
