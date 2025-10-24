import {
	determine_interactivity,
	get_component,
	get_inputs_outputs
} from "./init_utils";

import type {
	ComponentMeta,
	ProcessedComponentMeta,
	LayoutNode,
	Dependency,
	SharedProps,
	LoadingComponent,
	AppConfig
} from "./types";

import { allowed_shared_props } from "@gradio/utils";

type set_data_type = (data: Record<string, unknown>) => void;
type get_data_type = () => Promise<Record<string, unknown>>;
type visitor<T> = (node: T) => ProcessedComponentMeta;
export class AppTree {
	/** the raw component structure received from the backend */
	#component_payload: ComponentMeta[];
	/** the raw layout node structure received from the backend */
	#layout_payload: LayoutNode;
	/** the raw dependency structure received from the backend */
	#dependency_payload: Dependency[];

	/** the config for the app */
	#config: AppConfig;

	/** the root node of the processed layout tree */
	root = $state<ProcessedComponentMeta>();

	/** a map of component IDs to their component payload for easy lookup */
	#component_map: Map<number, ComponentMeta> = new Map();
	/** a map of component IDs to their processed component metadata for easy lookup */
	#processed_component_map: Map<number, ProcessedComponentMeta> = new Map();

	/** a set of all component IDs that are inputs to dependencies */
	#input_ids: Set<number> = new Set();
	/** a set of all component IDs that are outputs of dependencies */
	#output_ids: Set<number> = new Set();

	/** A list of components that are currently loading */
	#pending_components: Array<LoadingComponent> = [];

	#get_callbacks = new Map<number, get_data_type>();
	#set_callbacks = new Map<number, set_data_type>();

	constructor(
		components: ComponentMeta[],
		layout: LayoutNode,
		dependencies: Dependency[],
		config: AppConfig
	) {
		console.log("AppTree config:", config);
		this.#config = config;
		this.#component_payload = components;
		this.#layout_payload = layout;
		this.#dependency_payload = dependencies;
		this.root = this.create_node({ id: layout.id, children: [] }, true);
		this.prepare();
	}

	/**
	 * Registers a component with its ID and data callbacks
	 * @param id the ID of the component
	 * @param _set_data the set data callback
	 * @param _get_data the get data callback
	 */
	register_component(
		id: number,
		_set_data: set_data_type,
		_get_data: get_data_type
	): void {
		this.#set_callbacks.set(id, _set_data);
		this.#get_callbacks.set(id, _get_data);
	}

	/**
	 * Preprocess the payloads to get the correct state read to build the tree
	 */
	prepare() {
		const [inputs, outputs] = get_inputs_outputs(this.#dependency_payload);
		this.#input_ids = inputs;
		this.#output_ids = outputs;
	}

	/** Processes the layout payload into a tree of components */
	process() {
		this.root!.children = this.#layout_payload.children.map((node) =>
			this.traverse(node, (node) => this.create_node(node))
		);
		this.postprocess(this.root!);
	}

	async postprocess(tree: ProcessedComponentMeta) {
		this.root = this.traverse(tree, [
			(node) => handle_visibility(node, this.#config.root),
			(node) => handle_empty_forms(node, this.#config.root)
		]);
	}

	/**
	 * Traverses the layout tree and applies a callback to each node
	 * @param node the current layout node
	 * @param visit the callback to apply to each node
	 * @returns the return value of the callback, with a `children` property added for any child nodes
	 */

	traverse<T extends LayoutNode | ProcessedComponentMeta>(
		node: T,
		visit: visitor<T> | visitor<T>[]
	): ProcessedComponentMeta {
		function single_visit<U extends T>(
			node: U,
			visit: visitor<U>,
			traverse_fn: any
		): ProcessedComponentMeta {
			const result = visit(node);
			if ("children" in node) {
				result.children =
					node.children?.map((child) => traverse_fn(child, visit)) || [];
			}
			return result;
		}

		if (Array.isArray(visit)) {
			let result: ProcessedComponentMeta = node as ProcessedComponentMeta;
			for (const v of visit) {
				result = single_visit(result as T, v, this.traverse.bind(this));
			}
			return result;
		} else {
			return single_visit(node, visit, this.traverse.bind(this));
		}
	}

	/**
	 * Creates a processed component node from a layout node
	 * @param opts the layout node options
	 * @param root whether this is the root node
	 * @returns the processed component node
	 */
	create_node(opts: LayoutNode, root = false): ProcessedComponentMeta {
		let component: ComponentMeta | undefined;
		if (!root) {
			component = this.find_component_by_id(opts.id);
		} else {
			component = {
				type: "column",
				id: opts.id,
				// @ts-ignore
				props: {
					visible: true,
					root: "",
					theme_mode: "light"
				},
				component_class_id: "column",
				key: null
			};
		}

		if (!component) {
			throw new Error(`Component with ID ${opts.id} not found`);
		}

		const processed_props = gather_props(
			opts.id,
			component.props,
			[this.#input_ids, this.#output_ids],
			{ ...this.#config }
		);

		const node = {
			node_kind: "processed" as const,
			id: opts.id,
			type: component.type,
			props: processed_props,
			children: [],
			show_progress_on: null,
			component_class_id: component.component_class_id || component.type,
			component:
				processed_props.shared_props.visible !== false
					? get_component(
							component.type,
							component.component_class_id,
							this.#config.root || ""
						)
					: null,
			key: component.key,
			rendered_in: component.rendered_in,
			documentation: component.documentation
		};

		return node;
	}

	/**
	 * Get a component from its ID, caching as it goes
	 * @param id the ID of the component to find
	 * @returns the component metadata, or undefined if not found
	 * */
	find_component_by_id(id: number): ComponentMeta | undefined {
		if (this.#component_map.has(id)) {
			return this.#component_map.get(id);
		} else {
			for (const comp of this.#component_payload) {
				if (comp.id === id) {
					this.#component_map.set(id, comp);
					return comp;
				} else {
					if (!this.#component_map.has(comp.id)) {
						this.#component_map.set(comp.id, comp);
					}
				}
			}
		}
		return undefined;
	}

	/*
	 * Updates the state of a component by its ID
	 * @param id the ID of the component to update
	 * @param new_state the new state to set
	 * */
	async update_state(
		id: number,
		new_state: Partial<SharedProps> & Record<string, unknown>
	) {
		const _set_data = this.#set_callbacks.get(id);
		if (!_set_data) return;
		console.log("Updating state for component", id, "with", new_state);
		await _set_data(new_state);
		console.log("Updated state for component", id, new_state);
		this.root = this.traverse(this.root!, (n) =>
			handle_visibility(n, this.#config.root)
		);
	}

	/**
	 * Gets the current state of a component by its ID
	 * @param id the ID of the component to get the state of
	 * @returns the current state of the component, or null if not found
	 */
	async get_state(id: number): Promise<Record<string, unknown> | null> {
		const _get_data = this.#get_callbacks.get(id);
		if (!_get_data) return null;

		return await _get_data();
	}
}

/**
 * Gathers the props for a component
 * @param id the ID of the component
 * @param props the props of the component
 * @param dependencies the component's dependencies
 * @param additional any additional props to include
 * @returns the gathered props as an object with `shared_props` and `props` keys
 */
function gather_props(
	id: number,
	props: ComponentMeta["props"],
	dependencies: [Set<number>, Set<number>],
	additional: Record<string, unknown> = {}
): {
	shared_props: SharedProps;
	props: Record<string, unknown>;
} {
	const _shared_props: Partial<SharedProps> = {};
	const _props: Record<string, unknown> = {};
	for (const key in props) {
		if (allowed_shared_props.includes(key as keyof SharedProps)) {
			const _key = key as keyof SharedProps;
			_shared_props[_key] = props[key];
		} else {
			_props[key] = props[key];
		}
	}

	for (const key in additional) {
		if (allowed_shared_props.includes(key as keyof SharedProps)) {
			const _key = key as keyof SharedProps;
			_shared_props[_key] = additional[key];
		} else {
			_props[key] = additional[key];
		}
	}

	_shared_props.id = id;
	_shared_props.interactive = determine_interactivity(
		id,
		_shared_props.interactive,
		_props.value,
		dependencies
	);

	_shared_props.load_component = (name: string) =>
		get_component(name, "", _shared_props.root || "", "example");

	_shared_props.visible =
		_shared_props.visible === undefined ? true : _shared_props.visible;

	return { shared_props: _shared_props as SharedProps, props: _props };
}

function handle_visibility(
	node: ProcessedComponentMeta,
	root: string
): ProcessedComponentMeta {
	// Check if the node is visible
	if (node.props.shared_props.visible && !node.component) {
		const result: ProcessedComponentMeta = {
			...node,
			component: get_component(node.type, node.component_class_id, root),
			children: []
		};

		if (node.children) {
			result.children = node.children.map((child) =>
				handle_visibility(child, root)
			);
		}
		return result;
	} else {
		return node;
	}
}

function handle_empty_forms(
	node: ProcessedComponentMeta,
	root: string
): ProcessedComponentMeta {
	// Check if the node is visible
	if (node.type === "form") {
		const all_children_invisible = node.children.every(
			(child) =>
				child.props.shared_props.visible === false ||
				child.props.shared_props.visible === "hidden"
		);

		if (all_children_invisible) {
			node.props.shared_props.visible = false;
			return node;
		}
	}

	return node;
}
