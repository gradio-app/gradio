<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import HTML from "./shared/HTML.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	export let label: string;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
	}>;

	$: label, gradio.dispatch("change");
</script>

<Block {visible} {elem_id} {elem_classes} container={false}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		variant="center"
	/>
	<div class:pending={loading_status?.status === "pending"}>
		<HTML
			min_height={loading_status && loading_status?.status !== "complete"}
			{value}
			{elem_classes}
			{visible}
			on:change={() => gradio.dispatch("change")}
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
