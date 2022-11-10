export { default as Component } from "./Number.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "input_type": "number",
    "input_description": "numeric value",
    "example_input_data": config.value || Math.round(Math.random() * 10),
    "entered_input_preprocess": (val: string) => parseFloat(val),
    "output_type": "number",
    "output_description": "text string",
})
