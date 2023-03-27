<script lang="ts">
	import type { Value } from "../../Audio/types";

	export let value: Value;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<pre
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected>{value}</pre>

<style>
	pre {
		text-align: left;
	}
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>
