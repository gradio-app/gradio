import { writable, type Writable, get } from "svelte/store";
import type {
	ComponentMeta,
	Dependency,
	LayoutNode,
	TargetMap,
	LoadingComponent
} from "./types";
import { load_component } from "virtual:component-loader";
import type { client_return } from "@gradio/client";
import { create_loading_status_store } from "./stores";
import { _ } from "svelte-i18n";

export interface UpdateTransaction {
	id: number;
	value: any;
	prop: string;
}

let pending_updates: UpdateTransaction[][] = [];

/**
 * Create a store with the layout and a map of targets
 * @returns A store with the layout and a map of targets
 */
export function create_components(): {
	layout: Writable<ComponentMeta>;
	targets: Writable<TargetMap>;
	update_value: (updates: UpdateTransaction[]) => void;
	get_data: (id: number) => any | Promise<any>;
	loading_status: ReturnType<typeof create_loading_status_store>;
	scheduled_updates: Writable<boolean>;
	create_layout: (args: {
		app: client_return;
		components: ComponentMeta[];
		layout: LayoutNode;
		dependencies: Dependency[];
		root: string;
		options: {
			fill_height: boolean;
		};
	}) => void;
	rerender_layout: (args: {
		render_id: number;
		components: ComponentMeta[];
		layout: LayoutNode;
		root: string;
		dependencies: Dependency[];
	}) => void;
} {
	let _component_map: Map<number, ComponentMeta>;

	let target_map: Writable<TargetMap> = writable({});
	let _target_map: TargetMap = {};
	let inputs: Set<number>;
	let outputs: Set<number>;
	let constructor_map: Map<ComponentMeta["type"], LoadingComponent>;
	let instance_map: { [id: number]: ComponentMeta };
	let loading_status: ReturnType<typeof create_loading_status_store> =
		create_loading_status_store();
	const layout_store: Writable<ComponentMeta> = writable();
	let _components: ComponentMeta[] = [];
	let app: client_return;
	let keyed_component_values: Record<string | number, any> = {};
	let _rootNode: ComponentMeta;

	function create_layout({
		app: _app,
		components,
		layout,
		dependencies,
		root,
		options
	}: {
		app: client_return;
		components: ComponentMeta[];
		layout: LayoutNode;
		dependencies: Dependency[];
		root: string;
		options: {
			fill_height: boolean;
		};
	}): void {
		app = _app;
		store_keyed_values(_components);

		_components = components;
		inputs = new Set();
		outputs = new Set();
		pending_updates = [];
		constructor_map = new Map();
		_component_map = new Map();

		instance_map = {};

		_rootNode = {
			id: layout.id,
			type: "column",
			props: { interactive: false, scale: options.fill_height ? 1 : null },
			has_modes: false,
			instance: null as unknown as ComponentMeta["instance"],
			component: null as unknown as ComponentMeta["component"],
			component_class_id: "",
			key: null
		};

		components.push(_rootNode);

		dependencies.forEach((dep) => {
			loading_status.register(dep.id, dep.inputs, dep.outputs);
			dep.frontend_fn = process_frontend_fn(
				dep.js,
				!!dep.backend_fn,
				dep.inputs.length,
				dep.outputs.length
			);
			create_target_meta(dep.targets, dep.id, _target_map);
			get_inputs_outputs(dep, inputs, outputs);
		});

		target_map.set(_target_map);

		constructor_map = preload_all_components(components, root);

		instance_map = components.reduce(
			(acc, c) => {
				acc[c.id] = c;
				return acc;
			},
			{} as { [id: number]: ComponentMeta }
		);

		walk_layout(layout, root).then(() => {
			layout_store.set(_rootNode);
		});
	}

	/**
	 * Rerender the layout when the config has been modified to attach new components
	 */
	function rerender_layout({
		render_id,
		components,
		layout,
		root,
		dependencies
	}: {
		render_id: number;
		components: ComponentMeta[];
		layout: LayoutNode;
		root: string;
		dependencies: Dependency[];
	}): void {
		let _constructor_map = preload_all_components(components, root);
		_constructor_map.forEach((v, k) => {
			constructor_map.set(k, v);
		});

		_target_map = {};

		dependencies.forEach((dep) => {
			loading_status.register(dep.id, dep.inputs, dep.outputs);
			dep.frontend_fn = process_frontend_fn(
				dep.js,
				!!dep.backend_fn,
				dep.inputs.length,
				dep.outputs.length
			);
			create_target_meta(dep.targets, dep.id, _target_map);
			get_inputs_outputs(dep, inputs, outputs);
		});

		target_map.set(_target_map);

		let current_element = instance_map[layout.id];
		let all_current_children: ComponentMeta[] = [];
		const add_to_current_children = (component: ComponentMeta): void => {
			all_current_children.push(component);
			if (component.children) {
				component.children.forEach((child) => {
					add_to_current_children(child);
				});
			}
		};
		add_to_current_children(current_element);
		store_keyed_values(all_current_children);

		Object.entries(instance_map).forEach(([id, component]) => {
			let _id = Number(id);
			if (component.rendered_in === render_id) {
				delete instance_map[_id];
				if (_component_map.has(_id)) {
					_component_map.delete(_id);
				}
			}
		});

		components.forEach((c) => {
			instance_map[c.id] = c;
			_component_map.set(c.id, c);
		});
		if (current_element.parent) {
			current_element.parent.children![
				current_element.parent.children!.indexOf(current_element)
			] = instance_map[layout.id];
		}

		walk_layout(layout, root, current_element.parent).then(() => {
			layout_store.set(_rootNode);
		});
	}

	async function walk_layout(
		node: LayoutNode,
		root: string,
		parent?: ComponentMeta
	): Promise<ComponentMeta> {
		const instance = instance_map[node.id];

		instance.component = (await constructor_map.get(
			instance.component_class_id || instance.type
		))!?.default;
		instance.parent = parent;

		if (instance.type === "dataset") {
			instance.props.component_map = get_component(
				instance.type,
				instance.component_class_id,
				root,
				_components,
				instance.props.components
			).example_components;
		}

		if (_target_map[instance.id]) {
			instance.props.attached_events = Object.keys(_target_map[instance.id]);
		}

		instance.props.interactive = determine_interactivity(
			instance.id,
			instance.props.interactive,
			instance.props.value,
			inputs,
			outputs
		);

		instance.props.server = process_server_fn(
			instance.id,
			instance.props.server_fns,
			app
		);

		if (
			instance.key != null &&
			keyed_component_values[instance.key] !== undefined
		) {
			instance.props.value = keyed_component_values[instance.key];
		}

		_component_map.set(instance.id, instance);

		if (node.children) {
			instance.children = await Promise.all(
				node.children.map((v) => walk_layout(v, root, instance))
			);
		}

		return instance;
	}

	let update_scheduled = false;
	let update_scheduled_store = writable(false);

	function store_keyed_values(components: ComponentMeta[]): void {
		components.forEach((c) => {
			if (c.key != null) {
				keyed_component_values[c.key] = c.props.value;
			}
		});
	}

	function flush(): void {
		layout_store.update((layout) => {
			for (let i = 0; i < pending_updates.length; i++) {
				for (let j = 0; j < pending_updates[i].length; j++) {
					const update = pending_updates[i][j];
					if (!update) continue;
					const instance = instance_map[update.id];
					if (!instance) continue;
					let new_value;
					if (update.value instanceof Map) new_value = new Map(update.value);
					else if (update.value instanceof Set)
						new_value = new Set(update.value);
					else if (Array.isArray(update.value)) new_value = [...update.value];
					else if (update.value === null) new_value = null;
					else if (typeof update.value === "object")
						new_value = { ...update.value };
					else new_value = update.value;
					instance.props[update.prop] = new_value;
				}
			}
			return layout;
		});

		pending_updates = [];
		update_scheduled = false;
		update_scheduled_store.set(false);
	}

	function update_value(updates: UpdateTransaction[] | undefined): void {
		if (!updates) return;
		pending_updates.push(updates);

		if (!update_scheduled) {
			update_scheduled = true;
			update_scheduled_store.set(true);
			requestAnimationFrame(flush);
		}
	}

	function get_data(id: number): any | Promise<any> {
		const comp = _component_map.get(id);
		if (!comp) {
			return null;
		}
		if (comp.instance.get_value) {
			return comp.instance.get_value() as Promise<any>;
		}
		return comp.props.value;
	}

	return {
		layout: layout_store,
		targets: target_map,
		update_value,
		get_data,
		loading_status,
		scheduled_updates: update_scheduled_store,
		create_layout: (...args) =>
			requestAnimationFrame(() => create_layout(...args)),
		rerender_layout
	};
}

/** An async version of 'new Function' */
export const AsyncFunction: new (
	...args: string[]
) => (...args: any[]) => Promise<any> = Object.getPrototypeOf(
	async function () {}
).constructor;

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
): ((...args: unknown[]) => Promise<unknown[]>) | null {
	if (!source) return null;

	const wrap = backend_fn ? input_length === 1 : output_length === 1;
	try {
		return new AsyncFunction(
			"__fn_args",
			`  let result = await (${source})(...__fn_args);
  if (typeof result === "undefined") return [];
  return (${wrap} && !Array.isArray(result)) ? [result] : result;`
		);
	} catch (e) {
		console.error("Could not parse custom js method.");
		console.error(e);
		return null;
	}
}

/**
 * `Dependency.targets` is an array of `[id, trigger]` pairs with the ids as the `fn_id`.
 * This function take a single list of `Dependency.targets` and add those to the target_map.
 * @param targets the targets array
 * @param fn_id the function index
 * @param target_map the target map
 * @returns the tagert map
 */
export function create_target_meta(
	targets: Dependency["targets"],
	fn_id: number,
	target_map: TargetMap
): TargetMap {
	targets.forEach(([id, trigger]) => {
		if (!target_map[id]) {
			target_map[id] = {};
		}
		if (
			target_map[id]?.[trigger] &&
			!target_map[id]?.[trigger].includes(fn_id)
		) {
			target_map[id][trigger].push(fn_id);
		} else {
			target_map[id][trigger] = [fn_id];
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
 * Determines if a component is interactive
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

/**
 * Get a component from the backend
 * @param type the type of the component
 * @param class_id the class id of the component
 * @param root the root url of the app
 * @param components the list of component metadata
 * @param example_components the list of example components
 * @returns the component and its name
 */
export function get_component(
	type: string,
	class_id: string,
	root: string,
	components: ComponentMeta[],
	example_components?: string[]
): {
	component: LoadingComponent;
	name: ComponentMeta["type"];
	example_components?: Map<ComponentMeta["type"], LoadingComponent>;
} {
	let example_component_map: Map<ComponentMeta["type"], LoadingComponent> =
		new Map();
	if (type === "dataset" && example_components) {
		(example_components as string[]).forEach((name: string) => {
			if (example_component_map.has(name)) {
				return;
			}
			let _c;

			const matching_component = components.find((c) => c.type === name);
			if (matching_component) {
				_c = load_component({
					api_url: root,
					name,
					id: matching_component.component_class_id,
					variant: "example"
				});
				example_component_map.set(name, _c.component);
			}
		});
	}

	const _c = load_component({
		api_url: root,
		name: type,
		id: class_id,
		variant: "component"
	});

	return {
		component: _c.component,
		name: _c.name,
		example_components:
			example_component_map.size > 0 ? example_component_map : undefined
	};
}

/**
 * Preload all components
 * @param components A list of component metadata
 * @param root The root url of the app
 * @returns A map of component ids to their constructors
 */
export function preload_all_components(
	components: ComponentMeta[],
	root: string
): Map<ComponentMeta["type"], LoadingComponent> {
	let constructor_map: Map<ComponentMeta["type"], LoadingComponent> = new Map();

	components.forEach((c) => {
		const { component, example_components } = get_component(
			c.type,
			c.component_class_id,
			root,
			components
		);

		constructor_map.set(c.component_class_id || c.type, component);

		if (example_components) {
			for (const [name, example_component] of example_components) {
				constructor_map.set(name, example_component);
			}
		}
	});

	return constructor_map;
}
