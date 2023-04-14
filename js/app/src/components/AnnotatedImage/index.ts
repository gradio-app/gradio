export { default as Component } from "./AnnotatedImage.svelte";
export const modes = ["static"];

export const document = (config: Record<string, any>) => ({
	type: {
		payload: "[string, Array<[string, string]>]"
	},
	description: {
		payload:
			"path to base image, followed by a list of tuples [mask image path, label]"
	}
});
