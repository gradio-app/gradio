export { default as Component } from "./Image.svelte";
export { default as ExampleComponent } from "../Dataset/ExampleComponents/Image.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "string"
	},
	description: {
		payload: "image data as base64 string"
	},
	example_data:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
});
