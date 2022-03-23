<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";

	let messages: Array<[string, string]> = [
		["message one", "message two"],
		["message three", "message four"]
	];

	setTimeout(() => {
		messages = [...messages, ["message five", ""]];
	}, 1000);

	setTimeout(() => {
		messages = [...messages, ["message five", "message six"]];
	}, 2000);
</script>

<ChatBot value={messages} />
