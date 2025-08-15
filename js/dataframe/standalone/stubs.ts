export const client = {
	upload: async (
		files: any[],
		root: string,
		path?: string,
		max_file_size?: number
	) => {
		console.warn("Upload functionality not available in standalone mode");
		return files;
	},
	stream: () => {
		console.warn("Stream functionality not available in standalone mode");
		return () => {};
	}
};

export { default as BaseCheckbox } from "./stubs/BaseCheckbox.svelte";
export { default as Upload } from "./stubs/Upload.svelte";

export const StatusTracker = null;

export { default as FullscreenButton } from "./stubs/FullscreenButton.svelte";

export interface SelectData {
	index: number[];
	value: any;
	selected: boolean;
}

export type I18nFormatter = (key: string, ...args: any[]) => string;

export interface Client {
	upload: any;
	stream: any;
}
