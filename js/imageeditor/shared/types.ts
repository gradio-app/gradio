export interface ImageBlobs {
	background: Blob | null;
	layers: (Blob | null)[];
	composite: Blob | null;
}
