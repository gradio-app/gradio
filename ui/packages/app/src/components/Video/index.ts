export { default as Component } from "./Video.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: {
		input_payload: "{ name: string; data: string }",
		response_object: "{ name: string; data: string, is_file: boolean }"
	},
	description: {
		input_payload: "object with file name and base64 data",
		response_object:
			"object that includes path to video file. The URL: {ROOT}file={name} contains the data"
	}
});
