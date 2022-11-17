export { default as Component } from "./HTML.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
    "type": "string",
    "description": "HTML output"
})