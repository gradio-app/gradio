<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Block, BlockLabel } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};
	export let label: string = "Label";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<Block {elem_id}>
	<StatusTracker {...loading_status} />
	<BlockLabel Icon={LabelIcon} {label} />

	{#if value !== undefined && value !== null}
		<Label {value} {show_label} />
	{:else}
		<div class="min-h-[6rem] flex justify-center items-center">
			<div class="h-5 dark:text-white opacity-50"><LabelIcon /></div>
		</div>
	{/if}
</Block>
