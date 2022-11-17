export { default as Component } from "./Button.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: "string",
	description: "button label",
	example_data: config.value || "Run"
});
