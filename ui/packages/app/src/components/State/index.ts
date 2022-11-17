export { default as Component } from "./State.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
    "type": "Any",
    "description": "stored state value",
    "example_data": "",
})