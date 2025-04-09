export interface ImageBlobs {
	background: Blob | null;
	layers: (Blob | null)[];
	composite: Blob | null;
}

export interface LayerOptions {
	allow_additional_layers: boolean;
	layers: string[];
	disabled: boolean;
}

export type Source = "upload" | "webcam" | "clipboard";
export type Transform = "crop" | "resize";

export interface WebcamOptions {
	mirror: boolean;
	constraints: Record<string, any>;
}
