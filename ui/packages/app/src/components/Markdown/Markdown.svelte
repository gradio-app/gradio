<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Markdown } from "@gradio/markdown";

	export let label: string;
	export let value: string = "";
	export let default_value: string;
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");

	if (default_value) value = default_value;
</script>

<Markdown {value} {style} on:change />
