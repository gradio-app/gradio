<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let default_value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let style: string = "";
	export let loading_status: LoadingStatus;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	if (default_value) value = default_value;

	$: value, dispatch("change");
</script>

<Block>
	<StatusTracker {...loading_status} />

	{#if value !== undefined && value !== null}
		<Label {style} {value} {show_label} />
	{/if}
</Block>
