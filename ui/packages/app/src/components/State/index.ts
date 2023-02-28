export { default as Component } from "./State.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Any"
	},
	description: {
		payload: "stored state value"
	},
	example_data: ""
});
