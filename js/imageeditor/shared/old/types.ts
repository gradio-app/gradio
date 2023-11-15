import type { FileData } from "@gradio/client";

export interface Eraser {
	antialias: boolean;
	default_size: number;
	sizes: number[];
	size_mode: "fixed" | "defaults";
}

export interface Brush extends Eraser {
	default_color: [number, number, number, number] | string;
	colors: ([number, number, number, number] | string)[];
	color_mode: "fixed" | "defaults";
}

export interface PathData {
	path: { x: number; y: number }[];
	color: string | [number, number, number, number];
	size: number;
}

export interface EditorData {
	background: FileData | null;
	layers: FileData[] | null;
	composite: FileData | null;
}
