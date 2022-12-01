export { default as Component } from "./ProgressBar.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "number",
	description: "progress level between 0 and 1",
	example_data: 0.5
});
