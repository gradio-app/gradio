<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	export let value: Array<[string, string]> = [];

	$: console.log($$props);
</script>

<ChatBot {value} on:change />
