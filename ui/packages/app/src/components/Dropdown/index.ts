export { default as Component } from "./Dropdown.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "type": "string",
    "description": "selected choice",
    "example_data": config.choices.length ? config.choices[0] : "",
})