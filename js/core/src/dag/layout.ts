import type { DAGComponentNode, DAGDependencyNode, DAGNode, DAGEdge } from "./types";
import type { ComponentMeta, Dependency as IDependency } from "../types";

const LAYOUT_TYPES = new Set([
	"column",
	"row",
	"group",
	"tab",
	"tabs",
	"accordion",
	"tabitem"
]);

const COMP_WIDTH = 260;
const COMP_HEIGHT = 120;
const DEP_WIDTH = 200;
const DEP_HEIGHT = 70;
const V_SPACING = 140;
const COMP_X = 80;
const DEP_X = 600;
const START_Y = 40;

export function buildDAGState(
	components: ComponentMeta[],
	dependencies: IDependency[]
): { nodes: Map<string, DAGNode>; edges: DAGEdge[] } {
	const nodes = new Map<string, DAGNode>();
	const edges: DAGEdge[] = [];

	// Collect component IDs that participate in any dependency
	const participatingIds = new Set<number>();
	for (const dep of dependencies) {
		for (const id of dep.inputs) participatingIds.add(id);
		for (const id of dep.outputs) participatingIds.add(id);
		for (const [id] of dep.targets) participatingIds.add(id);
	}

	// Filter to non-layout components that participate in events
	const visibleComponents = components.filter(
		(c) => !LAYOUT_TYPES.has(c.type) && participatingIds.has(c.id)
	);

	// Place component nodes
	visibleComponents.forEach((comp, i) => {
		const node: DAGComponentNode = {
			kind: "component",
			id: comp.id,
			type: comp.type,
			label:
				(comp.props?.label as string) ||
				(comp.props?.value as string) ||
				comp.type,
			position: { x: COMP_X, y: START_Y + i * V_SPACING },
			width: COMP_WIDTH,
			height: COMP_HEIGHT
		};
		nodes.set(`comp_${comp.id}`, node);
	});

	// Place dependency nodes
	dependencies.forEach((dep, i) => {
		const node: DAGDependencyNode = {
			kind: "dependency",
			id: dep.id,
			label: dep.api_name || `fn_${dep.id}`,
			position: { x: DEP_X, y: START_Y + i * V_SPACING },
			width: DEP_WIDTH,
			height: DEP_HEIGHT
		};
		nodes.set(`dep_${dep.id}`, node);

		// Input edges: component RIGHT -> dependency LEFT
		for (const inputId of dep.inputs) {
			if (nodes.has(`comp_${inputId}`)) {
				edges.push({
					id: `in_${dep.id}_${inputId}`,
					from_node_id: `comp_${inputId}`,
					to_node_id: `dep_${dep.id}`,
					type: "input"
				});
			}
		}

		// Output edges: dependency RIGHT -> component LEFT
		for (const outputId of dep.outputs) {
			if (nodes.has(`comp_${outputId}`)) {
				edges.push({
					id: `out_${dep.id}_${outputId}`,
					from_node_id: `dep_${dep.id}`,
					to_node_id: `comp_${outputId}`,
					type: "output"
				});
			}
		}

		// Trigger edges: component BOTTOM -> dependency TOP
		for (const [targetId, eventName] of dep.targets) {
			if (nodes.has(`comp_${targetId}`)) {
				edges.push({
					id: `trig_${dep.id}_${targetId}_${eventName}`,
					from_node_id: `comp_${targetId}`,
					to_node_id: `dep_${dep.id}`,
					type: "trigger",
					label: eventName
				});
			}
		}
	});

	return { nodes, edges };
}
