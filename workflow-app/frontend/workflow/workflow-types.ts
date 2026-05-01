export type PortType = "image" | "text" | "audio" | "video" | "number" | "boolean" | "file" | "json" | "gallery" | "model3d" | "any";

export interface Port {
	id: string;
	label: string;
	type: PortType;
	required?: boolean;
	default_value?: unknown;
}

export interface FileValue {
	name: string;
	url: string;
	mime: string;
}

export type NodeDataValue = string | number | boolean | FileValue | null;
export type NodeData = Record<string, NodeDataValue>;
export type NodeStatus = "idle" | "running" | "done" | "error";

export interface WFNode {
	id: string;
	kind: "input" | "transform" | "output";
	label: string;
	source: "local" | "space";
	space_id?: string;
	endpoint?: string;
	inputs: Port[];
	outputs: Port[];
	x: number;
	y: number;
	width: number;
	height: number;
	data: NodeData;
}

export interface WFEdge {
	id: string;
	from_node_id: string;
	from_port_id: string;
	to_node_id: string;
	to_port_id: string;
	type: PortType;
}

export interface Workflow {
	version: "1";
	name: string;
	nodes: WFNode[];
	edges: WFEdge[];
}

export const PORT_COLOR: Record<PortType, string> = {
	image: "#4fd1a5",
	text: "#8b83e8",
	audio: "#f5a623",
	video: "#4d9cf5",
	number: "#e879a8",
	boolean: "#f59e0b",
	file: "#94a3b8",
	json: "#22d3ee",
	gallery: "#34d399",
	model3d: "#a78bfa",
	any: "#6b6e78"
};

export const PORT_COLOR_DIM: Record<PortType, string> = {
	image: "rgba(79, 209, 165, 0.15)",
	text: "rgba(139, 131, 232, 0.15)",
	audio: "rgba(245, 166, 35, 0.15)",
	video: "rgba(77, 156, 245, 0.15)",
	number: "rgba(232, 121, 168, 0.15)",
	boolean: "rgba(245, 158, 11, 0.15)",
	file: "rgba(148, 163, 184, 0.15)",
	json: "rgba(34, 211, 238, 0.15)",
	gallery: "rgba(52, 211, 153, 0.15)",
	model3d: "rgba(167, 139, 250, 0.15)",
	any: "rgba(107, 110, 120, 0.10)"
};

export const PORT_ICON: Record<PortType, string> = {
	image: "&#xe3f4;",
	text: "&#xe8e2;",
	audio: "&#xe310;",
	video: "&#xe04b;",
	number: "&#xe80e;",
	boolean: "&#xe836;",
	file: "&#xe24d;",
	json: "&#xe86f;",
	gallery: "&#xe3b6;",
	model3d: "&#xe84d;",
	any: "&#xe9e4;"
};

export const KIND_LABEL: Record<string, string> = {
	input: "IN",
	transform: "FN",
	output: "OUT"
};
