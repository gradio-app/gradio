import Component from "./Image3D.svelte";
import ExampleComponent from "./Example.svelte";
import { loadAsFile } from "../../utils/example_processors";

export default {
	component: Component,
	example: ExampleComponent,
	process_example: loadAsFile
};
