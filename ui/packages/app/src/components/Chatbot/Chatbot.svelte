<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let value: Array<[string, string]> = [];
	export let color_map: Array<[string, string]>;

	export let loading_status: LoadingStatus;
</script>

<Block padding={false} {elem_id}>
	<StatusTracker {...loading_status} />
	<ChatBot {value} {color_map} on:change />
</Block>
