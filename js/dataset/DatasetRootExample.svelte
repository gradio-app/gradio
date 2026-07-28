<script lang="ts">
	let { root }: { root?: string } = $props();
</script>

<span data-testid="dataset-root">{root ?? "missing"}</span>
