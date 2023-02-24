export { default as Component } from "./Json.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Object | Array"
	},
	description: {
		payload: "JSON object"
	}
});
