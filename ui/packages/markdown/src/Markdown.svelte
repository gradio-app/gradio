<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";

	export let value: string;
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-markdown prose" style="max-width: 100%">
	{@html value}
</div>
