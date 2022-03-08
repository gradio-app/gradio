<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	export let value: Array<[string, string]>;
</script>

<ChatBot {value} />
