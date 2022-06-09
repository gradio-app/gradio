<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";

	export let label: string;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<HTML {value} {elem_id} {visible} on:change />
