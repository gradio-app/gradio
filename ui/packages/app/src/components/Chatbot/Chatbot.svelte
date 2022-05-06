<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let value: Array<[string, string]> = [];
	export let default_value: Array<[string, string]>;
	export let style: string = "";
	export let color_map: Array<[string, string]>;

	export let loading_status: LoadingStatus;

	if (default_value) value = default_value;
</script>

<Block padding={false}>
	<StatusTracker {...loading_status} />
	<ChatBot {value} {style} {color_map} on:change />
</Block>
