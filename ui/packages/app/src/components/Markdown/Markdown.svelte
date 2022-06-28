<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Markdown } from "@gradio/markdown";

	export let label: string;
	export let elem_id: string = "";
	export let value: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<Markdown {value} {elem_id} on:change />
