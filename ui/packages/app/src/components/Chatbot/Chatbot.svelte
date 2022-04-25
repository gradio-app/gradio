<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";

	export let value: Array<[string, string]> = [];
	export let default_value: Array<[string, string]>;
	export let style: string = "";
	export let color_map: Array<[string, string]>;

	if (default_value) value = default_value;
</script>

<ChatBot {value} {style} {color_map} on:change />
