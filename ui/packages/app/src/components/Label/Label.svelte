<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let loading_status: LoadingStatus;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<Block {elem_id}>
	<StatusTracker {...loading_status} />

	{#if value !== undefined && value !== null}
		<Label  {value} {show_label} />
	{/if}
</Block>
