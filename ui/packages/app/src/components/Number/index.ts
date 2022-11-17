export { default as Component } from "./Number.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "type": "number",
    "description": "numeric value",
    "example_data": config.value ?? 1,
})
