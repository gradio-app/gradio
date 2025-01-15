import type { FileData } from "@gradio/client";

export interface GalleryImage {
	image: FileData;
	caption: string | null;
}

export interface GalleryVideo {
	video: FileData;
	caption: string | null;
}
