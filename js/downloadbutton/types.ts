import type { FileData } from "@gradio/client";

export interface DownloadButtonProps {
	value: FileData | null;
	variant: "primary" | "secondary" | "stop";
	size: "sm" | "lg";
	icon: FileData | null;
}

export interface DownloadButtonEvents {
	click: never;
}
