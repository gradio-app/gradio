import Component from "./Video.svelte";
import ExampleComponent from "./Example.svelte";
import { loadAsFile } from "../../utils/example_processors";

export default {
	component: Component,
	example: ExampleComponent,
	process_example: loadAsFile
};
