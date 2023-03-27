<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { Block } from "@gradio/atoms";

	export let label: string;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string = "";
	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<Block {visible} {elem_id} {elem_classes} disable={true}>
	<StatusTracker {...loading_status} variant="center" />
	<div class:pending={loading_status?.status === "pending"}>
		<HTML
			min_height={loading_status && loading_status?.status !== "complete"}
			{value}
			{elem_id}
			{elem_classes}
			{visible}
			on:change
		/>
	</div>
</Block>

<style>
	div {
		transition: 150ms;
	}

	.pending {
		opacity: 0.2;
	}
</style>
