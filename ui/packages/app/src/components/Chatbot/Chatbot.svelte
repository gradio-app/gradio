<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";

	export let value: Array<[string, string]> = [];
	export let default_value: Array<[string, string]>;
	export let style: string = "";

	export let loading_status: "complete" | "pending" | "error";

	if (default_value) value = default_value;
</script>

<Block padding={false}>
	<StatusTracker tracked_status={loading_status} />

	<ChatBot {value} {style} on:change />
</Block>
