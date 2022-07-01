<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label } from "@gradio/label";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Block, BlockLabel } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};
	export let label: string = "Label";
	export let style: Styles = {};

	export let loading_status: LoadingStatus;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<Block
	test_id="label"
	{visible}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	{#if show_label}
		<BlockLabel
			Icon={LabelIcon}
			{label}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}
	{#if typeof value === "object" && value !== undefined && value !== null}
		<Label {value} {show_label} />
	{:else}
		<div class="h-full min-h-[6rem] flex justify-center items-center">
			<div class="h-5 dark:text-white opacity-50"><LabelIcon /></div>
		</div>
	{/if}
</Block>
