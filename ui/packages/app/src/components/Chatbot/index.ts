export { default as Component } from "./Chatbot.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
    "type": "Array<[string, string]>",
    "description": "Represents list of message pairs of chat message.",
    "example_data": config.value ?? [["Hi", "Hello"], ["1 + 1", "2"]]
})