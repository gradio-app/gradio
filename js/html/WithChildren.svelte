<script lang="ts">
	import HTML from "./Index.svelte";
	let props = $props();
</script>

<HTML {...props}>
	<div data-testid="slot-content">child content</div>
</HTML>
