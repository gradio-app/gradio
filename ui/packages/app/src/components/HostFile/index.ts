export { default as Component } from "./HostFile.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "Tuple<Array<>, Array<>>",
	description: "A tuple of two lists, the first containing the folders in the directory path, and the second containing the files."
});
