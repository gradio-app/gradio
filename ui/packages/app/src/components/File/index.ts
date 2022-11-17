export { default as Component } from "./File.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "type": "{ name: string; data: string }",
    "description": "file name and base64 data as an object",
    "example_data": { name: "zip.zip", data: "data:@file/octet-stream;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=="},
})