import type { FileData } from "@gradio/client";

export interface Brush {
	antialias: boolean;
	default_size: number;
	default_color: number;
	colors: ([number, number, number, number] | string)[];
	color_mode: "fixed" | "defaults";
	sizes: number[];
	size_mode: "fixed" | "defaults";
}

interface PathData {
	path: { x: number; y: number }[];
	color: string;
	size: number;
}

export interface EditorData {
	background: FileData | null;
	layers: FileData[][] | PathData[][];
	composite: FileData | null;
}
