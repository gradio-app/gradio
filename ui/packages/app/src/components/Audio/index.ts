export { default as Component } from "./Audio.svelte";
export const modes = ["static", "dynamic"];

export const document = () => ({
	type: "{ name: string; data: string }",
	description: "audio data as base64 string",
	example_data: {
		name: "audio.wav",
		data: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
	}
});
