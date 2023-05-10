export { default as Component } from "./DataFrame.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "{ data: Array<Array<string | number>>; headers: Array<string> }"
	},
	description: {
		payload: "an object with an array of data and an array of headers"
	},
	example_data: config.value
});
