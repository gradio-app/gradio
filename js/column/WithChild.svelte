<script lang="ts">
	import Column from "./Index.svelte";
	let props = $props();
</script>

<Column {...props}>
	<div data-testid="slot-content">test child</div>
</Column>
