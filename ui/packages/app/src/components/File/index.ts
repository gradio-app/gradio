export { default as Component } from "./File.svelte";
import type { FileData, BinaryFileData } from "@gradio/upload";
export const modes = ["static", "dynamic"];

export const extract_binary = (value: null | BinaryFileData | Array<BinaryFileData>) => {
	if (value == null) return [null, null];
	if (Array.isArray(value)) {
		let output_text: Array<FileData> = value.map((x) => {
			let { blob, ...rest } = x;
			return rest;
		});
		let output_binary: Array<Blob> = value.map((x) => x.blob);
		return [output_text, output_binary];
	} else {
		let { blob, ...rest } = value;
		let output_text: FileData = rest;
		let output_binary: Blob = blob;
		return [output_text, output_binary];
	}
}

export const document = (config: Record<string, any>) => ({
	type: "{ name: string; data: string }",
	description: "file name and base64 data as an object",
	example_data: {
		name: "zip.zip",
		data: "data:@file/octet-stream;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=="
	}
});
