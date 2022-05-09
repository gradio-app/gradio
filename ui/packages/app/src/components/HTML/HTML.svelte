<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";

	export let label: string;
	export let value: string = "";
	export let default_value: string;
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
	if (default_value) value = default_value;
</script>

<HTML {value} {style} on:change />
