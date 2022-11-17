export { default as Component } from "./HighlightedText.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
    "type": "Array<[string, string | number]>",
    "description": "list of text spans and corresponding label / value"
})