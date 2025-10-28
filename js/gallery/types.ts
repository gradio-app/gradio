import type { FileData, SelectData } from "@gradio/client";

export interface GalleryImage {
	image: FileData;
	caption: string | null;
}

export interface GalleryVideo {
	video: FileData;
	caption: string | null;
}

export type GalleryData = GalleryImage | GalleryVideo;

export interface GalleryProps {
	value: GalleryData[] | null;
	file_types: string[] | null;
	columns: number | number[] | undefined;
	rows: number | number[] | undefined;
	height: number | "auto";
	preview: boolean;
	allow_preview: boolean;
	selected_index: number | null;
	object_fit: "contain" | "cover" | "fill" | "none" | "scale-down";
	buttons: string[];
	type: "numpy" | "pil" | "filepath";
}

export interface GalleryEvents {
	change: GalleryData[] | null;
	upload: GalleryData[] | null;
	select: SelectData;
	delete: { file: FileData; index: number };
	preview_open: never;
	preview_close: never;
	clear_status: any;
	share: any;
	error: any;
}
