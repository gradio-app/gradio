<script lang="ts">
	import Group from "./Index.svelte";
	let props = $props();
</script>

<Group {...props}>
	<div data-testid="slot-content">test child</div>
</Group>
