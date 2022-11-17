export { default as Component } from "./Video.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "{ name: string; data: string }",
	description: "file name and base64 data of video file"
});
