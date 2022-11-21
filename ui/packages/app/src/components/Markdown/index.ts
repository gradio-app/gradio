export { default as Component } from "./Markdown.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: "string",
	description: "HTML rendering of markdown"
});
