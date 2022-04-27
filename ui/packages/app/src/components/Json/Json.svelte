<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { JSON } from "@gradio/json";
	import { Block } from "@gradio/atoms";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";

	export let value: any = {};
	export let default_value: any;
	export let style: string = "";
	export let loading_status: "complete" | "pending" | "error";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	if (default_value) value = default_value;
</script>

<Block test_id="json">
	<StatusTracker tracked_status={loading_status} />

	<JSON {style} {value} />
</Block>
