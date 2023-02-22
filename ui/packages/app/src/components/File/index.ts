export { default as Component } from "./File.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "{ name: string; data: string }",
	},
	description: {
		payload: "object with file name and base64 data"
	},
	example_data: {
		name: "zip.zip",
		data: "data:@file/octet-stream;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=="
	}
});
