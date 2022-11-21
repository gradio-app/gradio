export { default as Component } from "./Model3D.svelte";
export { default as ExampleComponent } from "../Dataset/ExampleComponents/Model3D.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
	type: "{ name: string; data: string }",
	description: "file name and base64 data of Model3D object"
});
