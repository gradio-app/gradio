<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HTML } from "@gradio/html";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { Block } from "@gradio/atoms";

	export let label: string;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string = "";
	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: label, dispatch("change");
</script>

<Block {visible} {elem_id} disable={true}>
	<StatusTracker {...loading_status} variant="center" />
	<div
		class="transition"
		class:opacity-20={loading_status?.status === "pending"}
	>
		<HTML {value} {elem_id} {visible} on:change />
	</div>
</Block>
