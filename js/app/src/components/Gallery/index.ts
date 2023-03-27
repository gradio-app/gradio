export { default as Component } from "./Gallery.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Array<{ name: string } | [{ name: string }, string]>"
	},
	description: {
		payload: "list of objects, with filename and optional caption,"
	}
});
