export { default as Component } from "./CheckboxGroup.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Array<string>"
	},
	description: {
		payload: "list of selected choices"
	},
	example_data: config.choices.length ? [config.choices[0]] : []
});
