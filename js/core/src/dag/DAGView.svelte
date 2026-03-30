<script lang="ts">
	import type {
		ComponentMeta,
		Dependency as IDependency,
		ProcessedComponentMeta
	} from "../types";
	import type { DependencyManager } from "../dependency";
	import type { AppTree } from "../init.svelte";
	import type {
		DAGNode,
		DAGEdge,
		PendingConnection,
		PortInfo,
		Position
	} from "./types";
	import { buildDAGState } from "./layout";
	import DAGNodeComponent from "./DAGNode.svelte";
	import DAGEdges from "./DAGEdges.svelte";

	let {
		components,
		dependencies,
		dep_manager,
		app_tree,
		onclose
	}: {
		components: ComponentMeta[];
		dependencies: IDependency[];
		dep_manager: DependencyManager;
		app_tree: AppTree;
		onclose: () => void;
	} = $props();

	// Static node data (kind, id, type, label, width, height)
	let nodes: Map<string, DAGNode> = $state(new Map());
	// Reactive positions tracked separately for reliable Svelte 5 reactivity
	let positions: Record<string, Position> = $state({});
	let edges: DAGEdge[] = $state([]);

	let dragging: { node_id: string; offset_x: number; offset_y: number } | null =
		$state(null);
	let pending: PendingConnection | null = $state(null);
	let container: HTMLDivElement | undefined = $state(undefined);
	let inner: HTMLDivElement | undefined = $state(undefined);

	function build_processed_map(
		node: ProcessedComponentMeta | undefined,
		map: Map<number, ProcessedComponentMeta>
	): Map<number, ProcessedComponentMeta> {
		if (!node) return map;
		map.set(node.id, node);
		if (node.children) {
			for (const child of node.children) {
				build_processed_map(child, map);
			}
		}
		return map;
	}

	let processed_map = $derived.by(() => {
		return build_processed_map(app_tree.root, new Map());
	});

	function init_layout(): void {
		const result = buildDAGState(components, dependencies);
		nodes = result.nodes;
		edges = result.edges;
		// Extract positions into the reactive record
		const pos: Record<string, Position> = {};
		for (const [key, node] of result.nodes) {
			pos[key] = { ...node.position };
		}
		positions = pos;
	}

	$effect(() => {
		components;
		dependencies;
		init_layout();
	});

	let canvas_width = $derived.by(() => {
		let max = 900;
		for (const [key, node] of nodes) {
			const pos = positions[key];
			if (pos) {
				max = Math.max(max, pos.x + node.width + 100);
			}
		}
		return max;
	});

	let canvas_height = $derived.by(() => {
		let max = 600;
		for (const [key, node] of nodes) {
			const pos = positions[key];
			if (pos) {
				max = Math.max(max, pos.y + node.height + 100);
			}
		}
		return max;
	});

	function get_canvas_coords(e: MouseEvent): { x: number; y: number } {
		if (!inner) return { x: 0, y: 0 };
		const rect = inner.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	function handle_drag_start(node_id: string, e: MouseEvent): void {
		const pos = positions[node_id];
		if (!pos) return;
		const { x, y } = get_canvas_coords(e);
		dragging = {
			node_id,
			offset_x: x - pos.x,
			offset_y: y - pos.y
		};
	}

	function handle_mouse_move(e: MouseEvent): void {
		const { x, y } = get_canvas_coords(e);

		if (dragging) {
			positions[dragging.node_id] = {
				x: Math.max(0, x - dragging.offset_x),
				y: Math.max(0, y - dragging.offset_y)
			};
		} else if (pending) {
			pending = { ...pending, cursor: { x, y } };
		}
	}

	function handle_mouse_up(): void {
		if (pending) {
			pending = null;
		}
		dragging = null;
	}

	function handle_connect_start(port: PortInfo, e: MouseEvent): void {
		const { x, y } = get_canvas_coords(e);
		pending = {
			from: port,
			cursor: { x, y }
		};
	}

	function handle_disconnect(edge_id: string): void {
		edges = edges.filter((e) => e.id !== edge_id);
	}

	function handle_port_drop(port: PortInfo): void {
		if (!pending) return;
		const from = pending.from;

		const from_is_comp = from.node_id.startsWith("comp_");
		const to_is_comp = port.node_id.startsWith("comp_");
		if (from_is_comp === to_is_comp) {
			pending = null;
			return;
		}

		let edge_type: "input" | "output" | "trigger";
		let from_node_id: string;
		let to_node_id: string;

		if (from.edge_type === "trigger" || port.edge_type === "trigger") {
			edge_type = "trigger";
			from_node_id = from_is_comp ? from.node_id : port.node_id;
			to_node_id = from_is_comp ? port.node_id : from.node_id;
		} else if (from_is_comp) {
			edge_type = "input";
			from_node_id = from.node_id;
			to_node_id = port.node_id;
		} else {
			edge_type = "output";
			from_node_id = from.node_id;
			to_node_id = port.node_id;
		}

		const new_edge: DAGEdge = {
			id: `custom_${Date.now()}`,
			from_node_id,
			to_node_id,
			type: edge_type,
			label: edge_type === "trigger" ? "custom" : undefined
		};

		const exists = edges.some(
			(e) =>
				e.from_node_id === new_edge.from_node_id &&
				e.to_node_id === new_edge.to_node_id &&
				e.type === new_edge.type
		);
		if (!exists) {
			edges = [...edges, new_edge];
		}

		pending = null;
	}

	function handle_play(dep_id: number): void {
		dep_manager.dispatch({ type: "fn", fn_index: dep_id, event_data: null });
	}

	// Context menu
	let context_menu: { x: number; y: number } | null = $state(null);

	function handle_contextmenu(e: MouseEvent): void {
		e.preventDefault();
		if (!container) return;
		const rect = container.getBoundingClientRect();
		context_menu = {
			x: e.clientX - rect.left + container.scrollLeft,
			y: e.clientY - rect.top + container.scrollTop
		};
	}

	function close_context_menu(): void {
		context_menu = null;
	}

	function handle_new_component(): void {
		// TODO
		close_context_menu();
	}

	function handle_new_event_listener(): void {
		// TODO
		close_context_menu();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="dag-container"
	bind:this={container}
	onmousemove={handle_mouse_move}
	onmouseup={handle_mouse_up}
	onmouseleave={handle_mouse_up}
	oncontextmenu={handle_contextmenu}
	onclick={close_context_menu}
>
	<div class="dag-toolbar">
		<span class="dag-title">DAG View</span>
		<button class="toolbar-btn" onclick={init_layout}>Reset Layout</button>
		<button class="toolbar-btn close-btn" onclick={onclose}>&times;</button>
	</div>

	<div
		class="dag-inner"
		bind:this={inner}
		style:width="{canvas_width}px"
		style:height="{canvas_height}px"
	>
		<DAGEdges
			{nodes}
			{positions}
			{edges}
			{pending}
			ondisconnect={handle_disconnect}
		/>

		{#each [...nodes] as [key, node] (key)}
			<DAGNodeComponent
				{node}
				position={positions[key]}
				processed_node={node.kind === "component"
					? processed_map.get(node.id) ?? null
					: null}
				ondragstart={handle_drag_start}
				onconnectstart={handle_connect_start}
				onportdrop={handle_port_drop}
				onplay={node.kind === "dependency" ? handle_play : undefined}
			/>
		{/each}
	</div>

	{#if context_menu}
		<div
			class="context-menu"
			style:left="{context_menu.x}px"
			style:top="{context_menu.y}px"
		>
			<button class="context-menu-item" onclick={handle_new_component}>
				New Component
			</button>
			<button class="context-menu-item" onclick={handle_new_event_listener}>
				New Event Listener
			</button>
		</div>
	{/if}
</div>

<style>
	.dag-container {
		position: relative;
		width: 100%;
		min-height: 500px;
		flex: 1;
		overflow: auto;
		background:
			radial-gradient(
				circle,
				var(--border-color-primary, #e5e7eb) 1px,
				transparent 1px
			);
		background-size: 20px 20px;
		border-radius: 8px;
		border: 1px solid var(--border-color-primary, #e5e7eb);
	}

	.dag-toolbar {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--background-fill-primary, white);
		border-bottom: 1px solid var(--border-color-primary, #e5e7eb);
	}

	.dag-title {
		font-weight: 600;
		font-size: 14px;
		color: var(--body-text-color, #111827);
		margin-right: auto;
	}

	.toolbar-btn {
		padding: 4px 12px;
		border-radius: 6px;
		border: 1px solid var(--border-color-primary, #e5e7eb);
		background: var(--background-fill-primary, white);
		font-size: 12px;
		cursor: pointer;
		color: var(--body-text-color, #111827);
	}

	.toolbar-btn:hover {
		background: var(--background-fill-secondary, #f9fafb);
	}

	.close-btn {
		font-size: 16px;
		padding: 4px 8px;
	}

	.dag-inner {
		position: relative;
		min-width: 100%;
		min-height: 500px;
	}

	.context-menu {
		position: absolute;
		z-index: 20;
		background: var(--background-fill-primary, white);
		border: 1px solid var(--border-color-primary, #e5e7eb);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 4px 0;
		min-width: 180px;
	}

	.context-menu-item {
		display: block;
		width: 100%;
		padding: 8px 14px;
		border: none;
		background: none;
		text-align: left;
		font-size: 13px;
		color: var(--body-text-color, #111827);
		cursor: pointer;
	}

	.context-menu-item:hover {
		background: var(--background-fill-secondary, #f3f4f6);
	}
</style>
