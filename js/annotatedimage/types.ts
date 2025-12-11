import type { FileData } from "@gradio/client";
import type { CustomButton } from "@gradio/utils";

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
	buttons: (string | CustomButton)[];
}

export interface AnnotatedImageEvents {
	change: never;
	select: { index: number; value: string };
}
