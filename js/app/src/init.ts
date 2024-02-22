import { writable } from "svelte/store";
import type {
	ComponentMeta,
	Dependency,
	DependencyTypes,
	LayoutNode,
	TargetMap
} from "./types";

import type { client_return } from "@gradio/client";

/**
 *
 * @param components An array of component metadata
 * @param layout The layout tree
 * @param dependencies The events, triggers, inputs, and outputs
 * @returns A store with the layout and a map of targets
 */
export function create_components(
	components: ComponentMeta[],
	layout: LayoutNode,
	dependencies: Dependency[]
) {
	const _component_map = new Map();
	const layout_store = writable({});

	const target_map: TargetMap = {};
	const inputs = new Set<number>();
	const outputs = new Set<number>();

	dependencies.forEach((dep, fn_index) => {
		create_target_meta(dep.targets, fn_index, target_map);
		get_inputs_outputs(dep, inputs, outputs);
	});

	function update_value(id: number, value: any, prop: string): void {
		// update the value of a component
	}

	return {
		layout: layout_store,
		targets: target_map,
		update_value
	};
}

// process frontend_fn - done
// create target map - done
// create loading status store ???
// infer dynamic IDS
// set interactivity mode
// load example components + components
// walk layout + build tree

/** An async version of 'new Function' */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * Takes a string of source code and returns a function that can be called with arguments
 * @param source the source code
 * @param backend_fn if there is also a backend function
 * @param input_length the number of inputs
 * @param output_length the number of outputs
 * @returns The function, or null if the source code is invalid or missing
 */
export function process_frontend_fn(
	source: string | null | undefined | false,
	backend_fn: boolean,
	input_length: number,
	output_length: number
): ((...args: unknown[]) => Promise<unknown>) | null {
	if (!source) return null;

	const wrap = backend_fn ? input_length === 1 : output_length === 1;
	try {
		return new AsyncFunction(
			"__fn_args",
			`  let result = await (${source})(...__fn_args);
  return (${wrap} && !Array.isArray(result)) ? [result] : result;`
		);
	} catch (e) {
		console.error("Could not parse custom js method.");
		console.error(e);
		return null;
	}
}

/**
 * `Dependency.targets` is an array of `[id, trigger]` pairs with the indices as the `fn_index`.
 * This function take a single list of `Dependency.targets` and add those to the target_map.
 * @param targets the targets array
 * @param fn_index the function index
 * @param target_map the target map
 * @returns the tagert map
 */
export function create_target_meta(
	targets: Dependency["targets"],
	fn_index: number,
	target_map: TargetMap
): TargetMap {
	targets.forEach(([id, trigger]) => {
		if (!target_map[id]) {
			target_map[id] = {};
		}
		if (
			target_map[id]?.[trigger] &&
			!target_map[id]?.[trigger].includes(fn_index)
		) {
			target_map[id][trigger].push(fn_index);
		} else {
			target_map[id][trigger] = [fn_index];
		}
	});

	return target_map;
}

/**
 * Get all component ids that are an input or output of a dependency
 * @param dep the dependency
 * @param inputs the set of inputs
 * @param outputs the set of outputs
 * @returns a tuple of the inputs and outputs
 */
export function get_inputs_outputs(
	dep: Dependency,
	inputs: Set<number>,
	outputs: Set<number>
): [Set<number>, Set<number>] {
	dep.inputs.forEach((input) => inputs.add(input));
	dep.outputs.forEach((output) => outputs.add(output));
	return [inputs, outputs];
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

/**
 * Deternmines if a component is interactive
 * @param id component id
 * @param interactive_prop value of the interactive prop
 * @param value the main value of the component
 * @param inputs set of ids that are inputs to a dependency
 * @param outputs set of ids that are outputs to a dependency
 * @returns if the component is interactive
 */
export function determine_interactivity(
	id: number,
	interactive_prop: boolean | undefined,
	value: any,
	inputs: Set<number>,
	outputs: Set<number>
): boolean {
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

type ServerFunctions = Record<string, (...args: any[]) => Promise<any>>;

/**
 * Process the server function names and return a dictionary of functions
 * @param id the component id
 * @param server_fns the server function names
 * @param app the client instance
 * @returns the actual server functions
 */
export function process_server_fn(
	id: number,
	server_fns: string[] | undefined,
	app: client_return
): ServerFunctions {
	if (!server_fns) {
		return {};
	}
	return server_fns.reduce((acc, fn: string) => {
		acc[fn] = async (...args: any[]) => {
			if (args.length === 1) {
				args = args[0];
			}
			const result = await app.component_server(id, fn, args);
			return result;
		};
		return acc;
	}, {} as ServerFunctions);
}
