<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: string;
	export let style: Record<string, string> = {};

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-html">
	{@html value}
</div>
