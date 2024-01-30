<script lang="ts">
	import type { FileData } from "@gradio/client";

	export let value: FileData | null;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value ? (Array.isArray(value) ? value.join(", ") : value) : ""}
</div>

<style>
	div {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.gallery {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: var(--size-1) var(--size-2);
		text-align: left;
	}
</style>
