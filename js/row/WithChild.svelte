<script lang="ts">
	import Row from "./Index.svelte";
	let props = $props();
</script>

<Row {...props}>
	<div data-testid="slot-content">test child</div>
</Row>
