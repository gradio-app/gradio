import { setContext } from "svelte";

import { GRADIO_ROOT } from "@gradio/utils";

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
	LoadingComponent
} from "./types";

interface RootNode {
	type: "root";
	children: ProcessedComponentMeta[];
}

const allowed_shared_props: (keyof SharedProps)[] = [
	"elem_id",
	"elem_classes",
	"components",
	"visible",
	"interactive",
	"server_fns",
	"id",
	"target",
	"theme_mode",
	"version",
	"root",
	"autoscroll",
	"max_file_size",
	"formatter",
	"client",
	"load_component"
] as const;

type set_data_type = (data: Record<string, unknown>) => void;
type get_data_type = () => Promise<Record<string, unknown>>;

export class AppTree {
	/** the raw component structure received from the backend */
	#component_payload: ComponentMeta[];
	/** the raw layout node structure received from the backend */
	#layout_payload: LayoutNode;
	/** the raw dependency structure received from the backend */
	#dependency_payload: Dependency[];
	/** a map of event targets to their component metadata for easy lookup */
	event_target_map: Map<string, ComponentMeta> = new Map();

	/** the root node of the processed layout tree */
	root = $state<ProcessedComponentMeta>();

	/** a map of component IDs to their component payload for easy lookup */
	component_map: Map<number, ComponentMeta> = new Map();
	/** a map of component IDs to their processed component metadata for easy lookup */
	processed_component_map: Map<number, ProcessedComponentMeta> = new Map();

	/** a set of all component IDs that are inputs to dependencies */
	#input_ids: Set<number> = new Set();
	/** a set of all component IDs that are outputs of dependencies */
	#output_ids: Set<number> = new Set();

	/** A list of components that are currently loading */
	pending_components: Array<LoadingComponent> = [];

	get_callbacks = new Map<number, get_data_type>();
	set_callbacks = new Map<number, set_data_type>();

	constructor(
		components: ComponentMeta[],
		layout: LayoutNode,
		dependencies: Dependency[]
	) {
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
		this.set_callbacks.set(id, _set_data);
		this.get_callbacks.set(id, _get_data);
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
	async process() {
		this.root!.children = this.#layout_payload.children.map((node) =>
			this.traverse(node, (node) => this.create_node(node))
		);
	}

	/**
	 * Traverses the layout tree and applies a callback to each node
	 * @param node the current layout node
	 * @param visit the callback to apply to each node
	 * @returns the return value of the callback, with a `children` property added for any child nodes
	 */
	traverse(
		node: LayoutNode,
		visit: (node: LayoutNode) => ProcessedComponentMeta
	) {
		const result = visit(node);
		result.children =
			node.children?.map((child) => this.traverse(child, visit)) || [];
		return result;
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

		const node = {
			id: opts.id,
			type: component.type,
			props: gather_props(
				opts.id,
				{
					...component.props,
					onupdate: (args: {
						shared: Partial<SharedProps>;
						props: Record<string, unknown>;
					}) => this.update_state.apply(this, [opts.id, args])
				},
				[this.#input_ids, this.#output_ids]
			),
			children: [],
			show_progress_on: null,
			component: get_component(
				component.type,
				component.component_class_id,
				component.props.root || ""
			),
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
		if (this.component_map.has(id)) {
			return this.component_map.get(id);
		} else {
			for (const comp of this.#component_payload) {
				if (comp.id === id) {
					this.component_map.set(id, comp);
					return comp;
				} else {
					if (!this.component_map.has(comp.id)) {
						this.component_map.set(comp.id, comp);
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
	update_state(
		id: number,
		new_state: Partial<SharedProps> & Record<string, unknown>
	) {
		const _set_data = this.set_callbacks.get(id);
		if (!_set_data) return;

		_set_data(new_state);
	}

	/**
	 * Gets the current state of a component by its ID
	 * @param id the ID of the component to get the state of
	 * @returns the current state of the component, or null if not found
	 */
	async get_state(id: number): Promise<Record<string, unknown> | null> {
		const _get_data = this.get_callbacks.get(id);
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
	_shared_props.id = id;
	_shared_props.interactive = determine_interactivity(
		id,
		_shared_props.interactive,
		_props.value,
		dependencies
	);

	_shared_props.visible =
		_shared_props.visible === undefined ? true : _shared_props.visible;

	for (const key in additional) {
		if (allowed_shared_props.includes(key as keyof SharedProps)) {
			const _key = key as keyof SharedProps;
			_shared_props[_key] = props[key];
		} else {
			_props[key] = props[key];
		}
	}

	return { shared_props: _shared_props as SharedProps, props: _props };
}
