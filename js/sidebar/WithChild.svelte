<script lang="ts">
	import Sidebar from "./Index.svelte";
	let props = $props();
</script>

<Sidebar {...props}>
	<div data-testid="slot-content">test child</div>
</Sidebar>
