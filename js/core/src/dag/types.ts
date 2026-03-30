export interface Position {
	x: number;
	y: number;
}

export interface DAGComponentNode {
	kind: "component";
	id: number;
	type: string;
	label: string;
	position: Position;
	width: number;
	height: number;
}

export interface DAGDependencyNode {
	kind: "dependency";
	id: number;
	label: string;
	position: Position;
	width: number;
	height: number;
}

export type DAGNode = DAGComponentNode | DAGDependencyNode;

export interface DAGEdge {
	id: string;
	from_node_id: string;
	to_node_id: string;
	type: "input" | "output" | "trigger";
	label?: string;
}

export interface PortInfo {
	node_id: string;
	side: "left" | "right" | "top" | "bottom";
	edge_type: "input" | "output" | "trigger";
}

export interface PendingConnection {
	from: PortInfo;
	cursor: Position;
}
