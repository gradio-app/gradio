<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: string;
	export let theme: string = "default";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-html" {theme}>
	{@html value}
</div>
