export { default as Component } from "./Slider.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "number",
	description: "selected value",
	example_data: config.value ?? config.minimum
});
