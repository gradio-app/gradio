<script lang="ts">
	import Group from "./Index.svelte";
	let props = $props();
</script>

<Group {...props}>
	<div
		class="block gr-accordion"
		data-testid="grouped-accordion"
		style:border-style="solid"
	>
		grouped accordion
	</div>
	<div class="block" data-testid="grouped-block" style:border-style="solid">
		grouped block
	</div>
</Group>
