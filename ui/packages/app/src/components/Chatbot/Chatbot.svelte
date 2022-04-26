<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";

	export let value: Array<[string, string]> = [];
	export let style: string = "";
</script>

<ChatBot {value} {style} on:change />
