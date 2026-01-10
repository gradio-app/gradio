<script lang="ts">
	let { value }: { value: string | null } = $props();
</script>

{value || ""}
