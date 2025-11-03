import { load_component } from "virtual:component-loader";
import type { Dependency, LoadingComponent } from "./types";

/**
 * Load a component given its type and class_id without awaiting it
 * @param type
 * @param class_id
 * @param root
 * @returns the loading component
 */
export function get_component(
	type: string,
	class_id: string,
	root: string,
	variant: "component" | "example" | "base" = "component"
): LoadingComponent {
	if (type === "api") type = "state";

	return load_component({
		api_url: root,
		name: type,
		id: class_id,
		variant
	}).component;
}

/**
 * Get all component ids that are an input dependency and all that are an output dependency
 * @param dep the dependency
 * @param inputs the set of inputs
 * @param outputs the set of outputs
 * @returns a tuple of the inputs and outputs
 */
export function get_inputs_outputs(
	dependencies: Dependency[]
): [Set<number>, Set<number>] {
	const inputs = new Set<number>();
	const outputs = new Set<number>();
	for (const dep of dependencies) {
		dep.inputs.forEach((input) => inputs.add(input));
		dep.outputs.forEach((output) => outputs.add(output));
	}
	return [inputs, outputs];
}

/**
 * Determines if a component is interactive
 * explicitly set interactive prop takes precedence
 * if not set, then if the component is an input to a dependency, it is interactive
 * if not an input, but has no outputs and no default value, it is interactive (for dev)
 * everything else is not interactive
 * @param id component id
 * @param interactive_prop value of the interactive prop
 * @param value the main value of the component
 * @param dependencies a tuple of sets of input and output component ids
 * @returns if the component is interactive
 */
export function determine_interactivity(
	id: number,
	interactive_prop: boolean | undefined,
	value: any,
	dependencies: [Set<number>, Set<number>]
): boolean {
	if (id === 1) {
		console.log({
			interactive_prop,
			value,
			output: dependencies[0]
		});
	}

	const [inputs, outputs] = dependencies;

	if (interactive_prop === false) {
		return false;
	} else if (interactive_prop === true) {
		return true;
	} else if (
		inputs.has(id) ||
		(!outputs.has(id) && has_no_default_value(value))
	) {
		return true;
	}

	return false;
}

/**
 * Check if a value is not a default value
 * @param value the value to check
 * @returns default value boolean
 */
function has_no_default_value(value: any): boolean {
	return (
		(Array.isArray(value) && value.length === 0) ||
		value === "" ||
		value === 0 ||
		!value
	);
}

/** An async version of 'new Function' */
export const AsyncFunction: new (
	...args: string[]
) => (...args: any[]) => Promise<any> = Object.getPrototypeOf(
	async function () {}
).constructor;
