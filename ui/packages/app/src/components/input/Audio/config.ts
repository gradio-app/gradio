import Component from "./Audio.svelte";
import ExampleComponent from "./Example.svelte";
import Interpretation from "./Interpretation.svelte";
import { loadAsFile } from "../../utils/example_processors";

export default {
	component: Component,
	example: ExampleComponent,
	interpretation: Interpretation,
	process_example: loadAsFile
};
