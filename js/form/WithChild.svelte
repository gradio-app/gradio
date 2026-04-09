<script lang="ts">
	import Form from "./Index.svelte";
	let props = $props();
</script>

<Form {...props}>
	<div data-testid="slot-content">test child</div>
</Form>
