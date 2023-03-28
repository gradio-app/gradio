export { default as Component } from "./Chatbot.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Array<[string, string]>"
	},
	description: {
		payload: "list of message pairs of"
	},
	example_data: config.value?.length
		? config.value
		: [
				["Hi", "Hello"],
				["1 + 1", "2"]
		  ]
});
