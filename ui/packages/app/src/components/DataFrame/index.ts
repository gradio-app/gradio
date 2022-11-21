export { default as Component } from "./DataFrame.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: " { data: Array<Array<string | number>>; headers: Array<string> }",
	description: "hex color code",
	example_data: config.value ?? "#000000"
});
