<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";

	export let label: string;
	export let value: string = "";
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<HTML {value} {style} on:change />
