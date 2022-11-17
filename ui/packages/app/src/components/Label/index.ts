export { default as Component } from "./Label.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
    "type": "{ label: string; confidences?: Array<{ label: string; confidence: number }>",
    "description": "output label and optional set of confidences per label"
})