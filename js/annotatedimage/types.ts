import type { FileData } from "@gradio/client";

export interface Annotation {
	image: FileData;
	label: string;
}

export interface AnnotatedImageValue {
	image: FileData;
	annotations: Annotation[];
}

export interface AnnotatedImageProps {
	value: AnnotatedImageValue | null;
	show_legend: boolean;
	height: number | undefined;
	width: number | undefined;
	color_map: Record<string, string>;
	buttons: string[];
}

export interface AnnotatedImageEvents {
	change: never;
	select: { index: number; value: string };
}
