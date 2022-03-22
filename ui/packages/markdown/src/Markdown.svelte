<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";


	export let value: string;
	export let theme: string = "default";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-markdown prose" {theme}>
	{@html value}
</div>
