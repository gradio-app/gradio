<script lang="ts">
	import Draggable from "./Index.svelte";
	let props = $props();
</script>

<Draggable {...props}>
	<div data-testid="item-a">Item A</div>
	<div data-testid="item-b">Item B</div>
	<div data-testid="item-c">Item C</div>
</Draggable>
