import {
	determine_interactivity,
	get_component,
	get_inputs_outputs
} from "./init_utils";
import { translate_if_needed } from "./i18n";
import { tick } from "svelte";

import type {
	ComponentMeta,
	ProcessedComponentMeta,
	LayoutNode,
	Dependency,
	LoadingComponent,
	AppConfig,
	ServerFunctions
} from "./types";
import type { SharedProps } from "@gradio/utils";
import { allowed_shared_props } from "@gradio/utils";
import { Client } from "@gradio/client";

type client_return = Awaited<ReturnType<typeof Client.connect>>;

type set_data_type = (data: Record<string, unknown>) => void;
type get_data_type = () => Promise<Record<string, unknown>>;
type visitor<T> = (node: T) => ProcessedComponentMeta;

type Tab = {
	label: string;
	id: string;
	visible: boolean;
	interactive: boolean;
	elem_id: string | undefined;
	scale: number | null;
	order?: number;
};

const type_map = {
	walkthrough: "tabs",
	walkthroughstep: "tabitem"
};
export class AppTree {
	/** the raw component structure received from the backend */
	#component_payload: ComponentMeta[];
	/** the raw layout node structure received from the backend */
	#layout_payload: LayoutNode;
	/** the raw dependency structure received from the backend */
	#dependency_payload: Dependency[];
	/** Need this to set i18n in re-render */
	reactive_formatter: (str: string) => string = (str: string) => str;
	/** the config for the app */
	#config: AppConfig;
	client: client_return;

	/** the root node of the processed layout tree */
	root = $state<ProcessedComponentMeta>();

	/** a set of all component IDs that are inputs to dependencies */
	#input_ids: Set<number> = new Set();
	/** a set of all component IDs that are outputs of dependencies */
	#output_ids: Set<number> = new Set();

	/** A list of components that are currently loading */
	#pending_components: Array<LoadingComponent> = [];

	#get_callbacks = new Map<number, get_data_type>();
	#set_callbacks = new Map<number, set_data_type>();
	component_ids: number[];
	initial_tabs: Record<number, Tab[]> = {};

	components_to_register: Set<number> = new Set();
	ready: Promise<void>;
	ready_resolve!: () => void;
	resolved: boolean = false;

	constructor(
		components: ComponentMeta[],
		layout: LayoutNode,
		dependencies: Dependency[],
		config: Omit<AppConfig, "api_url">,
		app: client_return,
		reactive_formatter: (str: string) => string
	) {
		this.ready = new Promise<void>((resolve) => {
			this.ready_resolve = resolve;
		});
		this.reactive_formatter = reactive_formatter;
		this.#config = {
			...config,
			api_url: new URL(config.api_prefix, config.root).toString()
		};
		this.#component_payload = components;
		this.#layout_payload = layout;
		this.#dependency_payload = dependencies;
		this.root = this.create_node(
			{ id: layout.id, children: [] },
			new Map(),
			true
		);
		for (const comp of components) {
			if (comp.props.visible != false) this.components_to_register.add(comp.id);
		}

		this.client = app;

		this.prepare();

		const component_map = components.reduce((map, comp) => {
			map.set(comp.id, comp);
			return map;
		}, new Map<number, ComponentMeta>());

		this.root!.children = this.#layout_payload.children.map((node) =>
			this.traverse(node, (node) => {
				const new_node = this.create_node(
					node,
					component_map,
					false,
					this.reactive_formatter
				);
				return new_node;
			})
		);
		this.component_ids = components.map((c) => c.id);
		this.initial_tabs = {};
		gather_initial_tabs(this.root!, this.initial_tabs);
		this.postprocess(this.root!);
	}

	reload(
		components: ComponentMeta[],
		layout: LayoutNode,
		dependencies: Dependency[],
		config: Omit<AppConfig, "api_url">
	) {
		this.#layout_payload = layout;
		this.#component_payload = components;
		this.#config = {
			...config,
			api_url: new URL(config.api_prefix, config.root).toString()
		};
		this.#dependency_payload = dependencies;

		this.root = this.create_node(
			{ id: layout.id, children: [] },
			new Map(),
			true
		);
		for (const comp of components) {
			if (comp.props.visible != false) this.components_to_register.add(comp.id);
		}

		this.prepare();

		const component_map = components.reduce((map, comp) => {
			map.set(comp.id, comp);
			return map;
		}, new Map<number, ComponentMeta>());

		this.root!.children = this.#layout_payload.children.map((node) =>
			this.traverse(node, (node) => {
				const new_node = this.create_node(
					node,
					component_map,
					false,
					this.reactive_formatter
				);
				return new_node;
			})
		);
		this.component_ids = components.map((c) => c.id);
		this.initial_tabs = {};
		gather_initial_tabs(this.root!, this.initial_tabs);
		this.postprocess(this.root!);
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
		this.components_to_register.delete(id);
		if (this.components_to_register.size === 0 && !this.resolved) {
			this.resolved = true;
			this.ready_resolve();
		}
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
	process() {}

	postprocess(tree: ProcessedComponentMeta) {
		this.root = this.traverse(tree, [
			(node) => handle_visibility(node, this.#config.api_url),
			(node) =>
				untrack_children_of_invisible_parents(
					node,
					this.components_to_register
				),
			(node) => handle_empty_forms(node, this.components_to_register),
			(node) => translate_props(node),
			(node) => apply_initial_tabs(node, this.initial_tabs),
			(node) => this.find_attached_events(node, this.#dependency_payload),
			(node) =>
				untrack_children_of_closed_accordions_or_inactive_tabs(
					node,
					this.components_to_register
				)
		]);
	}

	find_attached_events(
		node: ProcessedComponentMeta,
		dependencies: Dependency[]
	): ProcessedComponentMeta {
		const attached_events = dependencies
			.filter((dep) => dep.targets.find(([id]) => id === node.id))
			.map((dep) => {
				const target = dep.targets.find(([id]) => id === node.id);
				return target ? target[1] : null;
			})
			.filter(Boolean) as string[];

		node.props.shared_props.attached_events = attached_events;

		return node;
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
			if ("children" in node && node.children.length > 0) {
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
	create_node(
		opts: LayoutNode,
		component_map: Map<number, ComponentMeta>,
		root = false,
		reactive_formatter?: (str: string) => string
	): ProcessedComponentMeta {
		let component: ComponentMeta | undefined;
		if (!root) {
			component = component_map.get(opts.id);
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
		if (reactive_formatter) {
			component.props.i18n = reactive_formatter;
		}
		const processed_props = gather_props(
			opts.id,
			component.props,
			[this.#input_ids, this.#output_ids],
			this.client,
			this.#config.api_url,
			{ ...this.#config }
		);

		const type =
			type_map[component.type as keyof typeof type_map] || component.type;

		const node = {
			id: opts.id,
			type: type,
			props: processed_props,
			children: [],
			show_progress_on: null,
			component_class_id: component.component_class_id || component.type,
			component:
				processed_props.shared_props.visible !== false
					? get_component(
							component.type,
							component.component_class_id,
							this.#config.api_url || ""
						)
					: null,
			key: component.key,
			rendered_in: component.rendered_in,
			documentation: component.documentation
		};

		return node;
	}

	rerender(components: ComponentMeta[], layout: LayoutNode) {
		const component_map = components.reduce((map, comp) => {
			map.set(comp.id, comp);
			return map;
		}, new Map<number, ComponentMeta>());
		const subtree = this.traverse(layout, (node) => {
			const new_node = this.create_node(
				node,
				component_map,
				false,
				this.reactive_formatter
			);
			return new_node;
		});

		const n = find_node_by_id(this.root!, subtree.id);

		if (!n) {
			throw new Error("Rerender failed: root node not found in current tree");
		}
		n.children = subtree.children;
	}

	/*
	 * Updates the state of a component by its ID
	 * @param id the ID of the component to update
	 * @param new_state the new state to set
	 * */
	async update_state(
		id: number,
		new_state: Partial<SharedProps> & Record<string, unknown>,
		check_visibility: boolean = true
	) {
		// Visibility is tricky 😅
		// If the component is not visible, it has not been rendered
		// and so it has no _set_data callback
		// Therefore, we need to traverse the tree and set the visible prop to true
		// and then render it and its children. After that, we can call the _set_data callback
		const node = find_node_by_id(this.root!, id);
		let already_updated_visibility = false;
		if (check_visibility && !node?.component) {
			await tick();
			this.root = this.traverse(this.root!, [
				//@ts-ignore
				(n) => set_visibility_for_updated_node(n, id, new_state.visible),
				(n) => handle_visibility(n, this.#config.api_url)
			]);
			already_updated_visibility = true;
		}
		const _set_data = this.#set_callbacks.get(id);
		if (!_set_data) return;
		_set_data(new_state);
		if (!check_visibility || already_updated_visibility) return;
		// need to let the UI settle before traversing again
		// otherwise there could be
		await tick();
		this.root = this.traverse(this.root!, (n) =>
			handle_visibility(n, this.#config.api_url)
		);
	}

	/**
	 * Gets the current state of a component by its ID
	 * @param id the ID of the component to get the state of
	 * @returns the current state of the component, or null if not found
	 */
	async get_state(id: number): Promise<Record<string, unknown> | null> {
		const _get_data = this.#get_callbacks.get(id);
		const component = this.#component_payload.find((c) => c.id === id);
		if (!_get_data && !component) return null;
		if (_get_data) return await _get_data();

		if (component) return Promise.resolve({ value: component.props.value });

		return null;
	}

	async render_previously_invisible_children(id: number) {
		this.root = this.traverse(this.root!, [
			(node) => {
				if (node.id === id) {
					node.children.forEach((child) => {
						child.props.shared_props.visible = true;
					});
				}
				return node;
			},
			(node) => handle_visibility(node, this.#config.api_url)
		]);
	}
}

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
	client: client_return,
	api_url: string,
	additional: Record<string, unknown> = {}
): {
	shared_props: SharedProps;
	props: Record<string, unknown>;
} {
	const _shared_props: Partial<SharedProps> = {};
	const _props: Record<string, unknown> = {};
	for (const key in props) {
		// For Tabs (or any component that already has an id prop)
		// Set the id to the props so that it doesn't get overwritten
		if (key === "id" || key === "autoscroll") {
			_props[key] = props[key];
		} else if (allowed_shared_props.includes(key as keyof SharedProps)) {
			const _key = key as keyof SharedProps;
			_shared_props[_key] = props[key];
			if (_key === "server_fns") {
				_shared_props.server = process_server_fn(id, props.server_fns, client);
			}
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

	_shared_props.client = client;
	_shared_props.id = id;
	_shared_props.interactive = determine_interactivity(
		id,
		_shared_props.interactive,
		_props.value,
		dependencies
	);

	_shared_props.load_component = (
		name: string,
		variant: "base" | "component" | "example"
	) => get_component(name, "", api_url, variant) as LoadingComponent;

	_shared_props.visible =
		_shared_props.visible === undefined ? true : _shared_props.visible;
	_shared_props.loading_status = {};

	return { shared_props: _shared_props as SharedProps, props: _props };
}

function handle_visibility(
	node: ProcessedComponentMeta,
	api_url: string
): ProcessedComponentMeta {
	// Check if the node is visible
	if (node.props.shared_props.visible && !node.component) {
		const result: ProcessedComponentMeta = {
			...node,
			component: get_component(node.type, node.component_class_id, api_url),
			children: []
		};

		if (node.children) {
			result.children = node.children.map((child) =>
				handle_visibility(child, api_url)
			);
		}
		return result;
	} else {
		return node;
	}
}

function set_visibility_for_updated_node(
	node: ProcessedComponentMeta,
	id: number,
	visible: boolean
): ProcessedComponentMeta {
	if (node.id == id) {
		node.props.shared_props.visible = visible;
	}
	return node;
}

function _untrack(
	node: ProcessedComponentMeta,
	components_to_register: Set<number>
): void {
	components_to_register.delete(node.id);
	if (node.children) {
		node.children.forEach((child) => _untrack(child, components_to_register));
	}
	return;
}

function untrack_children_of_invisible_parents(
	node: ProcessedComponentMeta,
	components_to_register: Set<number>
): ProcessedComponentMeta {
	// Check if the node is visible
	if (node.props.shared_props.visible !== true) {
		_untrack(node, components_to_register);
	}
	return node;
}

function untrack_children_of_closed_accordions_or_inactive_tabs(
	node: ProcessedComponentMeta,
	components_to_register: Set<number>
): ProcessedComponentMeta {
	// Check if the node is an accordion or tabs
	if (node.type === "accordion" && node.props.props.open === false) {
		_untrack(node, components_to_register);
		if (node.children) {
			node.children.forEach((child) => {
				child.props.shared_props.visible = false;
			});
		}
	}
	if (node.type === "tabs") {
		node.children.forEach((child) => {
			if (
				child.type === "tabitem" &&
				child.props.shared_props.id !==
					(node.props.props.selected || node.props.props.initial_tabs[0].id)
			) {
				_untrack(child, components_to_register);
				if (child.children) {
					child.children.forEach((grandchild) => {
						grandchild.props.shared_props.visible = false;
					});
				}
			}
		});
	}
	return node;
}

function handle_empty_forms(
	node: ProcessedComponentMeta,
	components_to_register: Set<number>
): ProcessedComponentMeta {
	// Check if the node is visible
	if (node.type === "form") {
		const all_children_invisible = node.children.every(
			(child) => child.props.shared_props.visible === false
		);

		if (all_children_invisible) {
			node.props.shared_props.visible = false;
			components_to_register.delete(node.id);
			return node;
		}
	}

	return node;
}

function translate_props(node: ProcessedComponentMeta): ProcessedComponentMeta {
	const supported_props = [
		"description",
		"info",
		"title",
		"placeholder",
		"value",
		"label"
	];
	for (const attr of Object.keys(node.props.shared_props)) {
		if (supported_props.includes(attr as string)) {
			// @ts-ignore
			node.props.shared_props[attr] = translate_if_needed(
				node.props.shared_props[attr as keyof SharedProps]
			);
		}
	}
	for (const attr of Object.keys(node.props.props)) {
		if (supported_props.includes(attr as string)) {
			node.props.props[attr] = translate_if_needed(node.props.props[attr]);
		}
	}
	return node;
}

function apply_initial_tabs(
	node: ProcessedComponentMeta,
	initial_tabs: Record<number, Tab[]>
): ProcessedComponentMeta {
	if (node.type === "tabs" && node.id in initial_tabs) {
		const tabs = initial_tabs[node.id].sort((a, b) => a.order! - b.order!);
		node.props.props.initial_tabs = tabs;
	}
	return node;
}

function _gather_initial_tabs(
	node: ProcessedComponentMeta,
	initial_tabs: Record<number, Tab[]>,
	parent_tab_id: number | null,
	order: number | null
): void {
	if (parent_tab_id !== null && node.type === "tabitem") {
		if (!(parent_tab_id in initial_tabs)) {
			initial_tabs[parent_tab_id] = [];
		}
		if (!("id" in node.props.props)) {
			node.props.props.id = node.id;
		}
		initial_tabs[parent_tab_id].push({
			label: node.props.shared_props.label as string,
			id: node.props.props.id as string,
			elem_id: node.props.shared_props.elem_id,
			visible: node.props.shared_props.visible as boolean,
			interactive: node.props.shared_props.interactive,
			scale: node.props.shared_props.scale || null
		});
		node.props.props.order = order;
	}
	if (node.children) {
		node.children.forEach((child, i) => {
			_gather_initial_tabs(
				child,
				initial_tabs,
				node.type === "tabs" ? node.id : null,
				node.type === "tabs" ? i : null
			);
		});
	}
	return;
}

function gather_initial_tabs(
	node: ProcessedComponentMeta,
	initial_tabs: Record<number, Tab[]>
): void {
	function single_visit<U extends ProcessedComponentMeta>(node: U): void {
		if ("children" in node && node.children.length > 0) {
			node.children?.forEach((child) =>
				_gather_initial_tabs(
					child,
					initial_tabs,
					node.type === "tabs" ? node.id : null,
					null
				)
			);
		}
	}
	return single_visit(node);
}

function find_node_by_id(
	tree: ProcessedComponentMeta,
	id: number
): ProcessedComponentMeta | null {
	if (tree.id === id) {
		return tree;
	}

	if (tree.children) {
		for (const child of tree.children) {
			const result = find_node_by_id(child, id);
			if (result) {
				return result;
			}
		}
	}

	return null;
}
