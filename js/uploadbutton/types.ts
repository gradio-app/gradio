import type { FileData } from "@gradio/client";

export interface UploadButtonProps {
	value: null | FileData | FileData[];
	file_count: string;
	file_types: string[];
	size: "sm" | "lg";
	icon: FileData | null;
	variant: "primary" | "secondary" | "stop";
}

export interface UploadButtonEvents {
	change: never;
	upload: never;
	click: never;
	error: string;
}
