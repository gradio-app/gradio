import type { FileData } from "@gradio/client";

export interface CustomButton {
	id: number;
	value: string | null;
	icon: FileData | null;
}
