<script lang="ts">
	import Tabs from "./Index.svelte";
	let props = $props();
</script>

<Tabs {...props}>
	<div data-testid="slot-content">tab panel content</div>
</Tabs>
