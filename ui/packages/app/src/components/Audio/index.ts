export { default as Component } from "./Audio.svelte";
export const modes = ["static", "dynamic"];

export const document = () => ({
    "input_type": "string | null",
    "input_description": "audio data as base64 string",
    "example_input_data": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    "output_type": "{ name: string; data: string } | null",
    "output_description": "object with file name and audio data as base64 string",
})