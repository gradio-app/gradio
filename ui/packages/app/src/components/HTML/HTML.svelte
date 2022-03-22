<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";
	export let label: string;
	export let value: string;
	export let theme: string;
	export let style: string | null;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<HTML {value} {theme} {style} on:change />
