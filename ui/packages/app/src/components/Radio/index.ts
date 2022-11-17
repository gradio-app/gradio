export { default as Component } from "./Radio.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "string",
	description: "selected choice",
	example_data: config.choices.length > 1 ? config.choices[0] : ""
});
