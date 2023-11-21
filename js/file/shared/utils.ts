import type { FileData } from "@gradio/client";

export const prettyBytes = (bytes: number): string => {
	let units = ["B", "KB", "MB", "GB", "PB"];
	let i = 0;
	while (bytes > 1024) {
		bytes /= 1024;
		i++;
	}
	let unit = units[i];
	return bytes.toFixed(1) + "&nbsp;" + unit;
};

export const display_file_name = (value: FileData): string => {
	const orig_name: string = value.orig_name ?? "";
	const max_length = 30;

	if (orig_name.length > max_length) {
		const truncated_name = orig_name.substring(0, max_length);
		const file_extension_index = orig_name.lastIndexOf(".");
		if (file_extension_index !== -1) {
			const file_extension = orig_name.slice(file_extension_index);
			return `${truncated_name}..${file_extension}`;
		}
		return truncated_name;
	}
	return orig_name;
};

export const display_file_size = (value: FileData | FileData[]): string => {
	var total_size = 0;
	if (Array.isArray(value)) {
		for (var file of value) {
			if (file.size !== undefined) total_size += file.size;
		}
	} else {
		total_size = value.size || 0;
	}
	return prettyBytes(total_size);
};
