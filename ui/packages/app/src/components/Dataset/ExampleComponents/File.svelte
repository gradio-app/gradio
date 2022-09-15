<script lang="ts">
	import type { FileData } from "../../File/types";
	export let value: FileData;
</script>

{#if Array.isArray(value)}
	<div class="truncate">{value.join(", ")}</div>
{:else}
	<div class="truncate">{value}</div>
{/if}
