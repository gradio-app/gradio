<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";

	let messages: Array<[string, string]> = [["message one", "message two"]];

	setTimeout(() => {
		messages = [...messages, ["message five", "•••"]];
	}, 1000);

	setTimeout(() => {
		messages[messages.length - 1][1] = "message six";
		messages = messages;
	}, 2000);
</script>

<ChatBot value={messages} />
