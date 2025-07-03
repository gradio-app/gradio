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
const is_browser = typeof window !== "undefined";
const raf = is_browser
	? requestAnimationFrame
	: async (fn: () => Promise<void> | void) => await fn();

/**
 * Create a store with the layout and a map of targets
 * @returns A store with the layout and a map of targets
 */
let has_run = new Set<number>();
export function create_components(initial_layout: ComponentMeta | undefined): {
	layout: Writable<ComponentMeta>;
	targets: Writable<TargetMap>;
	update_value: (updates: UpdateTransaction[]) => void;
	get_data: (id: number) => any | Promise<any>;
	modify_stream: (id: number, state: "open" | "waiting" | "closed") => void;
	get_stream_state: (id: number) => "open" | "waiting" | "closed" | "not_set";
	set_time_limit: (id: number, time_limit: number | undefined) => void;
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
	}) => Promise<void>;
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
	const layout_store: Writable<ComponentMeta> = writable(initial_layout);
	let _components: ComponentMeta[] = [];
	let app: client_return;
	let keys_per_render_id: Record<number, (string | number)[]> = {};
	let _rootNode: ComponentMeta;

	// Store current layout and root for dynamic visibility recalculation
	let current_layout: LayoutNode;
	let current_root: string;

	function set_event_specific_args(dependencies: Dependency[]): void {
		dependencies.forEach((dep) => {
			dep.targets.forEach((target) => {
				const instance = instance_map[target[0]];
				if (instance && dep.event_specific_args?.length > 0) {
					dep.event_specific_args?.forEach((arg: string) => {
						instance.props[arg] = dep[arg as keyof Dependency];
					});
				}
			});
		});
	}

	async function create_layout({
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
	}): Promise<void> {
		// make sure the state is settled before proceeding
		flush();
		app = _app;

		if (instance_map) {
			// re-render in reload mode
			components.forEach((c) => {
				if (c.props.value == null && c.id in instance_map) {
					c.props.value = instance_map[c.id].props.value;
				}
			});
		}

		_components = components;
		inputs = new Set();
		outputs = new Set();
		pending_updates = [];
		constructor_map = new Map();
		_component_map = new Map();

		instance_map = {};

		// Store current layout and root for dynamic visibility recalculation
		current_layout = layout;
		current_root = root;

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
			loading_status.register(
				dep.id,
				dep.inputs,
				dep.show_progress_on || dep.outputs
			);
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

		constructor_map = preload_visible_components(components, layout, root);

		instance_map = components.reduce(
			(acc, c) => {
				acc[c.id] = c;
				return acc;
			},
			{} as { [id: number]: ComponentMeta }
		);

		await walk_layout(layout, root, _components);

		layout_store.set(_rootNode);
		set_event_specific_args(dependencies);
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
		// Update current layout and root for dynamic visibility recalculation
		current_layout = layout;
		current_root = root;

		components.forEach((c) => {
			for (const prop in c.props) {
				if (c.props[prop] === null) {
					c.props[prop] = undefined;
				}
			}
		});
		let replacement_components: ComponentMeta[] = [];
		let new_components: ComponentMeta[] = [];
		components.forEach((c) => {
			if (c.key == null || !keys_per_render_id[render_id]?.includes(c.key)) {
				new_components.push(c);
			} else {
				replacement_components.push(c);
			}
		});
		let _constructor_map = preload_visible_components(
			new_components,
			layout,
			root
		);
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

		Object.entries(instance_map).forEach(([id, component]) => {
			let _id = Number(id);
			if (component.rendered_in === render_id) {
				let replacement_component = replacement_components.find(
					(c) => c.key === component.key
				);
				if (component.key != null && replacement_component !== undefined) {
					const instance = instance_map[component.id];
					for (const prop in replacement_component.props) {
						if (
							!(
								replacement_component.props.preserved_by_key as
									| string[]
									| undefined
							)?.includes(prop)
						) {
							instance.props[prop] = replacement_component.props[prop];
						}
					}
				} else {
					delete instance_map[_id];
					if (_component_map.has(_id)) {
						_component_map.delete(_id);
					}
				}
			}
		});

		const components_to_add = new_components.concat(
			replacement_components.filter((c) => !instance_map[c.id])
		);

		components_to_add.forEach((c) => {
			instance_map[c.id] = c;
			_component_map.set(c.id, c);
		});
		if (current_element.parent) {
			current_element.parent.children![
				current_element.parent.children!.indexOf(current_element)
			] = instance_map[layout.id];
		}

		walk_layout(
			layout,
			root,
			_components.concat(components),
			current_element.parent
		).then(() => {
			layout_store.set(_rootNode);
			keys_per_render_id[render_id] = components
				.map((c) => c.key)
				.filter((c) => c != null) as (string | number)[];
		});

		set_event_specific_args(dependencies);
	}

	async function walk_layout(
		node: LayoutNode,
		root: string,
		components: ComponentMeta[],
		parent?: ComponentMeta
	): Promise<ComponentMeta> {
		const instance = instance_map[node.id];
		if (!instance.component) {
			const constructor_key = instance.component_class_id || instance.type;
			let component_constructor = constructor_map.get(constructor_key);

			// Only load component if it was preloaded (i.e., it's visible)
			if (component_constructor) {
				instance.component = (await component_constructor)?.default;
			}
			// If component wasn't preloaded, leave it unloaded for now
			// It will be loaded later when/if it becomes visible
		}
		instance.parent = parent;

		// if (instance.type === "timer") {
		// 	console.log("timer", instance, constructor_map);
		// }

		if (instance.type === "dataset") {
			instance.props.component_map = get_component(
				instance.type,
				instance.component_class_id,
				root,
				components,
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

		_component_map.set(instance.id, instance);

		if (node.children) {
			instance.children = await Promise.all(
				node.children.map((v) => walk_layout(v, root, components, instance))
			);
		}

		if (instance.type === "tabs" && !instance.props.initial_tabs) {
			const tab_items_props =
				node.children?.map((c, i) => {
					const instance = instance_map[c.id];
					instance.props.id ??= c.id;
					return {
						type: instance.type,
						props: {
							...(instance.props as any),
							id: instance.props.id,
							order: i
						}
					};
				}) || [];

			const child_tab_items = tab_items_props.filter(
				(child) => child.type === "tabitem"
			);

			instance.props.initial_tabs = child_tab_items?.map((child) => ({
				label: child.props.label,
				id: child.props.id,
				visible:
					typeof child.props.visible === "boolean" ? child.props.visible : true,
				interactive: child.props.interactive,
				order: child.props.order
			}));
		}

		if (instance.type === "tabs") {
			node.children?.forEach((c, i) => {
				const child = instance_map[c.id];
				child.props.order = i;
			});
		}

		return instance;
	}

	let update_scheduled = false;
	let update_scheduled_store = writable(false);

	/**
	 * Load newly visible components after visibility changes
	 * @param newly_visible_ids Set of component IDs that are now visible
	 */
	async function load_newly_visible_components(
		newly_visible_ids: Set<number>
	): Promise<void> {
		if (newly_visible_ids.size === 0) return;

		const components_to_load = _components.filter((c) =>
			newly_visible_ids.has(c.id)
		);

		for (const component of components_to_load) {
			const constructor_key = component.component_class_id || component.type;

			// Only load if not already loaded
			if (!constructor_map.has(constructor_key)) {
				const { component: loadable_component, example_components } =
					get_component(
						component.type,
						component.component_class_id,
						current_root,
						_components
					);

				constructor_map.set(constructor_key, loadable_component);

				if (example_components) {
					for (const [name, example_component] of example_components) {
						constructor_map.set(name, example_component);
					}
				}

				// Load the component if it doesn't exist yet
				if (!component.component) {
					component.component = (await loadable_component)?.default;
				}
			} else {
				component.component =
					(await constructor_map.get(constructor_key))?.default ??
					component.component;
			}
		}
	}

	/**
	 * Check if any visibility-affecting properties have changed
	 * @param updates Array of update transactions
	 * @returns True if visibility might have changed
	 */
	function has_visibility_changes(updates: UpdateTransaction[][]): boolean {
		return updates.some((update_batch) =>
			update_batch.some((update) => {
				const instance = instance_map[update.id];
				if (!instance) return false;

				// Check for visibility property changes
				if (update.prop === "visible") return true;

				// Check for selected tab changes in tabs components
				if (update.prop === "selected" && instance.type === "tabs") return true;

				return false;
			})
		);
	}

	function flush(): void {
		const had_visibility_changes = has_visibility_changes(pending_updates);
		let previous_visible_ids: Set<number> | undefined;

		// Capture current visibility state before applying updates
		if (had_visibility_changes && current_layout) {
			previous_visible_ids = determine_visible_components(
				current_layout,
				_components
			);
		}

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
					else if (update.value == null) new_value = null;
					else if (typeof update.value === "object")
						new_value = { ...update.value };
					else new_value = update.value;
					instance.props[update.prop] = new_value;
				}
			}
			return layout;
		});

		// After applying updates, check if we need to load new components
		if (had_visibility_changes && current_layout && previous_visible_ids) {
			raf(async () => {
				const new_visible_ids = determine_visible_components(
					current_layout,
					_components
				);
				const newly_visible_ids = new Set<number>();

				// Find components that are now visible but weren't before
				for (const id of new_visible_ids) {
					if (!previous_visible_ids!.has(id)) {
						newly_visible_ids.add(id);
					}
				}

				// Load the newly visible components
				await load_newly_visible_components(newly_visible_ids);

				// Trigger a layout update to render the newly loaded components
				if (newly_visible_ids.size > 0) {
					layout_store.update((layout) => layout);
				}
			});
		}

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
			raf(flush);
		}
	}
	function get_data(id: number): any | Promise<any> {
		let comp = _component_map.get(id);
		if (!comp) {
			const layout = get(layout_store);
			comp = findComponentById(layout, id);
		}
		if (!comp) {
			return null;
		}
		if (comp.instance?.get_value) {
			return comp.instance.get_value() as Promise<any>;
		}
		return comp.props.value;
	}

	function findComponentById(
		node: ComponentMeta,
		id: number
	): ComponentMeta | undefined {
		if (node.id === id) {
			return node;
		}
		if (node.children) {
			for (const child of node.children) {
				const result = findComponentById(child, id);
				if (result) {
					return result;
				}
			}
		}
		return undefined;
	}

	function modify_stream(
		id: number,
		state: "open" | "closed" | "waiting"
	): void {
		const comp = _component_map.get(id);
		if (comp && comp.instance?.modify_stream_state) {
			comp.instance.modify_stream_state(state);
		}
	}

	function get_stream_state(
		id: number
	): "open" | "closed" | "waiting" | "not_set" {
		const comp = _component_map.get(id);
		if (comp?.instance?.get_stream_state)
			return comp.instance.get_stream_state();
		return "not_set";
	}

	function set_time_limit(id: number, time_limit: number | undefined): void {
		const comp = _component_map.get(id);
		if (comp?.instance?.set_time_limit) {
			comp.instance.set_time_limit(time_limit);
		}
	}

	return {
		layout: layout_store,
		targets: target_map,
		update_value,
		get_data,
		modify_stream,
		get_stream_state,
		set_time_limit,
		loading_status,
		scheduled_updates: update_scheduled_store,
		create_layout: create_layout,
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
	source: string | null | undefined | boolean,
	backend_fn: boolean,
	input_length: number,
	output_length: number
): ((...args: unknown[]) => Promise<unknown[]>) | null {
	if (!source || source === true) return null;

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
	if (type === "api") type = "state";
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
 * Check if a tab item should be visible based on selection state
 * @param component The tab item component
 * @param component_visible Whether the component is visible
 * @param parent_tabs_context Tab context from parent
 * @returns Whether the tab item should be visible
 */
function is_tab_item_visible(
	component: ComponentMeta,
	component_visible: boolean,
	parent_tabs_context?: { selected_tab_id?: string | number }
): boolean {
	const is_selected_tab =
		parent_tabs_context?.selected_tab_id === component.id ||
		parent_tabs_context?.selected_tab_id === component.props.id;
	return component_visible && is_selected_tab;
}

/**
 * Determine the selected tab ID for a tabs component
 * @param component The tabs component
 * @param layout The layout node
 * @param components All components
 * @returns The selected tab ID
 */
function get_selected_tab_id(
	component: ComponentMeta,
	layout: LayoutNode,
	components: ComponentMeta[]
): string | number | undefined {
	// Check if selected prop is a string or number
	const selected = component.props.selected;
	if (typeof selected === "string" || typeof selected === "number") {
		return selected;
	}

	// If no tab is explicitly selected, find the first visible and interactive tab
	if (layout.children) {
		for (const child of layout.children) {
			const child_component = components.find((c) => c.id === child.id);
			if (
				child_component?.type === "tabitem" &&
				child_component.props.visible !== false &&
				child_component.props.interactive !== false
			) {
				return (
					child_component.id || (child_component.props.id as string | number)
				);
			}
		}
	}

	return undefined;
}

/**
 * Process children components for visibility
 * @param layout The layout node
 * @param components All components
 * @param parent_tabs_context Tab context
 * @returns Set of visible child component IDs
 */
function process_children_visibility(
	layout: LayoutNode,
	components: ComponentMeta[],
	parent_tabs_context?: { selected_tab_id?: string | number }
): Set<number> {
	const visible_components: Set<number> = new Set();

	if (layout.children) {
		for (const child of layout.children) {
			const child_visible = determine_visible_components(
				child,
				components,
				true,
				parent_tabs_context
			);
			child_visible.forEach((id) => visible_components.add(id));
		}
	}

	return visible_components;
}

/**
 * Determine which components should be visible based on layout structure and visibility rules
 * @param layout The layout tree
 * @param components All component metadata
 * @param parent_visible Whether the parent component is visible
 * @param parent_tabs_context Information about parent tabs if any
 * @returns Set of component IDs that should be visible
 */
function determine_visible_components(
	layout: LayoutNode,
	components: ComponentMeta[],
	parent_visible = true,
	parent_tabs_context?: { selected_tab_id?: string | number }
): Set<number> {
	const visible_components: Set<number> = new Set();
	const component = components.find((c) => c.id === layout.id);

	if (!component) {
		return visible_components;
	}

	// Check if the component itself is visible
	const component_visible =
		parent_visible &&
		(typeof component.props.visible === "boolean"
			? component.props.visible
			: true);

	// Handle tab_item special case
	if (component.type === "tabitem") {
		if (
			is_tab_item_visible(component, component_visible, parent_tabs_context)
		) {
			visible_components.add(component.id);

			// Process children if this tab item is visible
			const child_visible = process_children_visibility(
				layout,
				components,
				parent_tabs_context
			);
			child_visible.forEach((id) => visible_components.add(id));
		}
		// If tab item is not visible, none of its children should be loaded
		return visible_components;
	}

	// Handle tabs component
	if (component.type === "tabs") {
		if (component_visible) {
			visible_components.add(component.id);

			// Determine which tab should be selected
			const selected_tab_id = get_selected_tab_id(
				component,
				layout,
				components
			);

			// Process children with tabs context
			const child_visible = process_children_visibility(layout, components, {
				selected_tab_id
			});
			child_visible.forEach((id) => visible_components.add(id));
		}
		return visible_components;
	}

	// For regular components
	if (component_visible) {
		visible_components.add(component.id);

		// Process children if this component is visible
		const child_visible = process_children_visibility(
			layout,
			components,
			parent_tabs_context
		);
		child_visible.forEach((id) => visible_components.add(id));
	}
	// If component is not visible, don't process children

	return visible_components;
}

/**
 * Preload only visible components
 * @param components A list of component metadata
 * @param layout The layout tree to determine visibility
 * @param root The root url of the app
 * @returns A map of component ids to their constructors
 */
export function preload_visible_components(
	components: ComponentMeta[],
	layout: LayoutNode,
	root: string
): Map<ComponentMeta["type"], LoadingComponent> {
	let constructor_map: Map<ComponentMeta["type"], LoadingComponent> = new Map();

	// Determine which components should be visible
	const visible_component_ids = determine_visible_components(
		layout,
		components
	);

	// Only preload visible components
	components.forEach((c) => {
		if (visible_component_ids.has(c.id)) {
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
		}
	});

	return constructor_map;
}

/**
 * Preload all components (legacy function, kept for backwards compatibility)
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
