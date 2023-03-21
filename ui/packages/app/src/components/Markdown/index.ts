export { default as Component } from "./Markdown.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "string"
	},
	description: {
		payload: "HTML rendering of markdown"
	}
});
