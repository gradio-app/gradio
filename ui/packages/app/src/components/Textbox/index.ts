export { default as Component } from "./Textbox.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "input_type": "string",
    "input_description": "text string",
    "example_input_data": config.value || "hello world",
    "output_type": "string",
    "output_description": "text string",
})