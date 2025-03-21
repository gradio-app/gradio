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
