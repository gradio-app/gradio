export { default as Component } from "./Dropdown.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "string"
	},
	description: {
		payload: "selected choice"
	},
	example_data: config.choices.length ? config.choices[0] : ""
});
