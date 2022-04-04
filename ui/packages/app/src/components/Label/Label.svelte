<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";

	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let default_value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};
	export let theme: string;
	export let style: string | null;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	if (default_value) value = default_value;

	$: value, dispatch("change");
</script>

{#if value !== undefined && value !== null}
	<Label {theme} {style} {value} />
{/if}
