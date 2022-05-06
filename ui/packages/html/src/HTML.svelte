<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: string;
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-html" {style}>
	{@html value}
</div>
