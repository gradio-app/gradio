import { writable } from "svelte/store";
import type { ComponentMeta, Dependency, LayoutNode } from "./types";

// export let components: ComponentMeta[];
// export let layout: LayoutNode;
// export let dependencies: Dependency[];

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
	dependencies: Dependency
) {
	const _component_map = new Map();
	const layout_store = writable({});
	const target_map = new Map();

	function update_value(id: number, value: any, prop: string): void {
		// update the value of a component
	}

	return {
		layout: layout_store,
		targets: target_map,
		update_value
	};
}

// process frontend_fn
// create target map ???
// create loading status store ???]
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
