export { default as Component } from "./Audio.svelte";
export const modes = ["static", "dynamic"];

export const document = () => ({
	type: {
		input_payload: "{ name: string; data: string }",
		response_object: "{ name: string; data: string, is_file: boolean }"
	},
	description: {
		input_payload: "audio data as object with filename and base64 string",
		response_object:
			"audio data as object with filename. `{DEMO URL}/file={name}` hosts the audio"
	},
	example_data: {
		name: "audio.wav",
		data: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
	}
});
