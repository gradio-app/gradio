<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";

	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

{#if value !== undefined && value !== null}
	<Label {style} {value} />
{/if}
