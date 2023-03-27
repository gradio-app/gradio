export { default as Component } from "./HighlightedText.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "Array<[string, string | number]>"
	},
	description: {
		payload: "list of text spans and corresponding label / value"
	}
});
