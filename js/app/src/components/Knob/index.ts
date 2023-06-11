export { default as Component } from "./Knob.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "number"
	},
	description: {
		payload: "selected value"
	},
	example_data: config.value ?? config.minimum
});
