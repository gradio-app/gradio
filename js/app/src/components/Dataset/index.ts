export { default as Component } from "./Dataset.svelte";
export const modes = ["dynamic"];

export const document = () => ({
	type: {
		payload: "number"
	},
	description: {
		payload: "index of selected row"
	},
	example_data: 0
});
