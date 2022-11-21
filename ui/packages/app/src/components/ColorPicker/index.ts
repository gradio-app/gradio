export { default as Component } from "./ColorPicker.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "string",
	description: "hex color code",
	example_data: config.value ?? "#000000"
});
