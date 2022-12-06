export { default as Component } from "./Checkbox.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "boolean",
	description: "checked status",
	example_data: config.value ?? true
});
