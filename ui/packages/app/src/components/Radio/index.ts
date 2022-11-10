export { default as Component } from "./Radio.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "input_type": "string",
    "input_description": "selected choice",
    "example_input_data": config.choices.length ? config.choices[0] : "",
    "output_type": "string",
    "output_description": "selected choice",
})